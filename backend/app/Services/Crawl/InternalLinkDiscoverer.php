<?php

namespace App\Services\Crawl;

use Illuminate\Support\Str;
use Symfony\Component\DomCrawler\Crawler;
use Symfony\Component\DomCrawler\UriResolver;

class InternalLinkDiscoverer
{
    public function __construct(
        private readonly UrlNormalizer $urls,
    ) {}

    /**
     * @return list<string> Unique URLs sorted by relevance score (desc), then length
     */
    public function discover(string $pageUrl, string $html, int $limit): array
    {
        $crawler = new Crawler();
        try {
            $crawler->addHtmlContent($html, 'UTF-8');
        } catch (\Throwable) {
            return [];
        }

        $found = [];
        $crawler->filter('a[href]')->each(function (Crawler $node) use ($pageUrl, &$found): void {
            $href = $node->attr('href');
            if ($href === null || $href === '') {
                return;
            }

            $href = trim($href);
            if ($href === '' || Str::startsWith($href, ['#', 'javascript:', 'mailto:', 'tel:'])) {
                return;
            }

            $absolute = UriResolver::resolve($href, $pageUrl);
            $absolute = strtok($absolute, '#') ?: $absolute;

            try {
                $normalized = $this->urls->normalize($absolute);
            } catch (\Throwable) {
                return;
            }

            if (! $this->urls->isSameSite($pageUrl, $normalized)) {
                return;
            }

            if (! Str::startsWith($normalized, ['http://', 'https://'])) {
                return;
            }

            $found[$normalized] = ($found[$normalized] ?? 0) + 1;
        });

        $scored = [];
        foreach (array_keys($found) as $link) {
            $scored[] = ['url' => $link, 'score' => $this->scorePath($link)];
        }

        usort($scored, function (array $a, array $b): int {
            if ($a['score'] !== $b['score']) {
                return $b['score'] <=> $a['score'];
            }

            return strlen($a['url']) <=> strlen($b['url']);
        });

        $urls = array_map(fn (array $row) => $row['url'], $scored);

        return array_slice(array_values(array_unique($urls)), 0, $limit);
    }

    private function scorePath(string $url): int
    {
        $path = strtolower(parse_url($url, PHP_URL_PATH) ?: '');
        $score = 0;
        $keywords = [
            'about' => 50, 'story' => 40, 'team' => 30,
            'product' => 45, 'shop' => 45, 'collection' => 40, 'category' => 40,
            'catalog' => 35, 'services' => 40, 'service' => 35,
            'contact' => 35, 'support' => 25,
            'pricing' => 30, 'plans' => 25,
        ];

        foreach ($keywords as $word => $points) {
            if (str_contains($path, $word)) {
                $score += $points;
            }
        }

        return $score;
    }
}
