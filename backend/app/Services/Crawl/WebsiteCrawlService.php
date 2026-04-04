<?php

namespace App\Services\Crawl;

use App\Enums\PageType;
use App\Enums\RenderMethod;
use App\Models\CrawledPage;
use App\Models\Project;
use Symfony\Component\DomCrawler\Crawler;

class WebsiteCrawlService
{
    public function __construct(
        private readonly UrlNormalizer $urls,
        private readonly HttpPageFetcher $http,
        private readonly PlaywrightPageRenderer $playwright,
        private readonly HtmlTextExtractor $textExtractor,
        private readonly InternalLinkDiscoverer $linkDiscoverer,
        private readonly PageTypeClassifier $classifier,
        private readonly PageImageExtractor $imageExtractor,
    ) {}

    public function crawl(Project $project): void
    {
        $project->crawledPages()->delete();

        $maxPages = max(1, (int) config('marketing.crawl.max_pages', 8));
        $minChars = (int) config('marketing.crawl.min_text_chars_for_http', 400);

        $startUrl = $this->urls->normalize($project->website_url);
        $toVisit = [$startUrl];
        $visited = [];

        while ($toVisit !== [] && count($visited) < $maxPages) {
            $url = array_shift($toVisit);
            if (isset($visited[$url])) {
                continue;
            }
            $visited[$url] = true;

            $fetch = $this->http->fetch($url);
            $method = RenderMethod::Http;
            $html = null;
            $title = null;

            if ($fetch !== null) {
                $html = $fetch['html'];
                $title = $this->extractTitle($html);
                $text = $this->textExtractor->extract($html);
                if (mb_strlen($text) < $minChars) {
                    $rendered = $this->playwright->render($url);
                    if ($rendered !== null) {
                        $html = $rendered['html'];
                        $method = RenderMethod::Playwright;
                        $title = $rendered['title'] ?: $title;
                        $text = $this->textExtractor->extract($html);
                    }
                }
            } else {
                $rendered = $this->playwright->render($url);
                if ($rendered !== null) {
                    $html = $rendered['html'];
                    $method = RenderMethod::Playwright;
                    $title = $rendered['title'];
                    $text = $this->textExtractor->extract($html);
                }
            }

            if ($html === null || trim($text ?? '') === '') {
                continue;
            }

            $text = (string) $text;
            $pageType = $this->classifier->classify($url, $title);
            $images = $this->imageExtractor->extract($html, $url);

            CrawledPage::query()->create([
                'project_id' => $project->id,
                'url' => $url,
                'page_type' => $pageType,
                'title' => $title,
                'raw_html' => mb_strlen($html) < 500_000 ? $html : null,
                'extracted_text' => mb_substr($text, 0, 120_000),
                'images' => $images === [] ? null : $images,
                'render_method' => $method,
            ]);

            if (count($visited) >= $maxPages) {
                break;
            }

            if ($url === $startUrl || count($visited) <= 3) {
                $discovered = $this->linkDiscoverer->discover(
                    $url,
                    $html,
                    limit: max($maxPages * 4, 24)
                );
                foreach ($discovered as $next) {
                    if (! isset($visited[$next])) {
                        $toVisit[] = $next;
                    }
                }
            }
        }

        if ($project->crawledPages()->count() === 0) {
            throw new \RuntimeException(
                'Could not extract readable content from this website. It may block automated access or require authentication.'
            );
        }
    }

    private function extractTitle(string $html): ?string
    {
        try {
            $crawler = new Crawler();
            $crawler->addHtmlContent($html, 'UTF-8');
            $t = $crawler->filter('title')->first();
            if ($t->count() === 0) {
                return null;
            }
            $text = trim($t->text(''));

            return $text === '' ? null : mb_substr($text, 0, 500);
        } catch (\Throwable) {
            return null;
        }
    }

    public function buildContextDocument(Project $project): string
    {
        $max = (int) config('marketing.ai.max_context_chars', 24_000);
        $parts = [];
        $pages = $project->crawledPages()->orderBy('id')->get();

        foreach ($pages as $page) {
            $parts[] = sprintf(
                "### Page: %s (%s)\nURL: %s\n\n%s\n",
                $page->page_type->value,
                $page->title ?? 'Untitled',
                $page->url,
                $page->extracted_text
            );
        }

        $combined = implode("\n\n---\n\n", $parts);

        if (mb_strlen($combined) <= $max) {
            return $combined;
        }

        return mb_substr($combined, 0, $max)."\n\n[TRUNCATED]";
    }
}
