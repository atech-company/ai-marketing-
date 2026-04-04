<?php

namespace App\Services\Crawl;

use Masterminds\HTML5;
use Symfony\Component\DomCrawler\Crawler;

class HtmlTextExtractor
{
    public function extract(string $html): string
    {
        if (trim($html) === '') {
            return '';
        }

        $crawler = new Crawler();
        try {
            $crawler->addHtmlContent($html, 'UTF-8');
        } catch (\Throwable) {
            $html5 = new HTML5;
            $dom = $html5->loadHTML($html);
            $crawler = new Crawler($dom);
        }

        $crawler->filter('script, style, noscript, svg, template, iframe')->each(function (Crawler $node): void {
            foreach ($node as $domElement) {
                $domElement->parentNode?->removeChild($domElement);
            }
        });

        $text = $crawler->filter('body')->count() > 0
            ? $crawler->filter('body')->text('')
            : $crawler->text('');

        $text = preg_replace('/\s+/u', ' ', $text) ?? '';

        return trim($text);
    }
}
