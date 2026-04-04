<?php

namespace App\Services\Crawl;

use Symfony\Component\DomCrawler\Crawler;
use Symfony\Component\DomCrawler\UriResolver;

class PageImageExtractor
{
    /**
     * @return list<array{url: string, alt: ?string, kind: string}>
     */
    public function extract(string $html, string $pageUrl): array
    {
        if (trim($html) === '') {
            return [];
        }

        $max = max(4, (int) config('marketing.crawl.max_images_per_page', 12));
        $seen = [];
        $out = [];

        $push = function (string $src, ?string $alt, string $kind) use (&$out, &$seen, $pageUrl, $max): void {
            if (count($out) >= $max) {
                return;
            }
            $src = trim($src);
            if ($src === '' || str_starts_with($src, 'data:') || str_starts_with($src, 'blob:')) {
                return;
            }
            try {
                $absolute = UriResolver::resolve($src, $pageUrl);
            } catch (\Throwable) {
                return;
            }
            if (! str_starts_with($absolute, 'http://') && ! str_starts_with($absolute, 'https://')) {
                return;
            }
            if ($this->shouldExcludeImageUrl($absolute)) {
                return;
            }
            if (isset($seen[$absolute])) {
                return;
            }
            $seen[$absolute] = true;
            $out[] = [
                'url' => $absolute,
                'alt' => $alt !== null && $alt !== '' ? mb_substr($alt, 0, 500) : null,
                'kind' => $kind,
            ];
        };

        try {
            $crawler = new Crawler();
            $crawler->addHtmlContent($html, 'UTF-8');
        } catch (\Throwable) {
            return [];
        }

        foreach ($crawler->filter('meta[property="og:image"], meta[name="og:image"]') as $node) {
            $c = new Crawler($node);
            $content = $c->attr('content');
            if ($content) {
                $push($content, null, 'og:image');
            }
        }

        foreach ($crawler->filter('meta[property="og:image:secure_url"]') as $node) {
            $c = new Crawler($node);
            $content = $c->attr('content');
            if ($content) {
                $push($content, null, 'og:image:secure');
            }
        }

        foreach ($crawler->filter('meta[name="twitter:image"], meta[name="twitter:image:src"]') as $node) {
            $c = new Crawler($node);
            $content = $c->attr('content');
            if ($content) {
                $push($content, null, 'twitter:image');
            }
        }

        foreach ($crawler->filter('link[rel="image_src"]') as $node) {
            $c = new Crawler($node);
            $href = $c->attr('href');
            if ($href) {
                $push($href, null, 'image_src');
            }
        }

        if (preg_match_all('/"image"\s*:\s*"([^"]+\.(?:jpg|jpeg|png|gif|webp)[^"]*)"/i', $html, $m)) {
            foreach ($m[1] as $u) {
                $push($u, null, 'json_ld');
            }
        }

        $crawler->filter('img[src]')->each(function (Crawler $img) use ($push): void {
            $src = $img->attr('src');
            if ($src === null || $src === '') {
                return;
            }
            $w = (int) ($img->attr('width') ?: 0);
            $h = (int) ($img->attr('height') ?: 0);
            if ($w > 0 && $h > 0 && ($w < 32 || $h < 32)) {
                return;
            }
            $alt = $img->attr('alt');
            $push($src, $alt, 'img');
        });

        return $out;
    }

    /**
     * Drop stock UI icons (share bars, social glyphs) — not product/marketing photos.
     */
    private function shouldExcludeImageUrl(string $url): bool
    {
        $host = strtolower((string) (parse_url($url, PHP_URL_HOST) ?? ''));
        if ($host === 'img.icons8.com' || str_ends_with($host, '.icons8.com')) {
            return true;
        }

        $path = strtolower((string) (parse_url($url, PHP_URL_PATH) ?? ''));
        // e.g. .../color/32/.../whatsapp.png — tiny glyphs when width/height attrs are missing on <img>
        if (preg_match('#/(?:16|24|32|48|64)/#', $path)) {
            if (preg_match('#/(whatsapp|instagram-new|facebook|twitter|linkedin|pinterest|tiktok|youtube|telegram)(?:[^/]*)?\.(png|gif|webp|svg)$#i', $path)) {
                return true;
            }
        }

        return false;
    }
}
