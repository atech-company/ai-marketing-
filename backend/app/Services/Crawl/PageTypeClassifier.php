<?php

namespace App\Services\Crawl;

use App\Enums\PageType;

class PageTypeClassifier
{
    public function classify(string $url, ?string $title = null): PageType
    {
        $path = strtolower(parse_url($url, PHP_URL_PATH) ?: '/');
        $haystack = $path.' '.strtolower((string) $title);

        if ($path === '/' || $path === '') {
            return PageType::Home;
        }

        if (str_contains($haystack, 'about') || str_contains($haystack, 'our-story') || str_contains($haystack, 'team')) {
            return PageType::About;
        }

        if (str_contains($haystack, 'contact') || str_contains($haystack, 'support')) {
            return PageType::Contact;
        }

        if (
            str_contains($haystack, 'collection')
            || str_contains($haystack, 'category')
            || str_contains($haystack, 'catalog')
            || str_contains($haystack, 'categories')
        ) {
            return PageType::Collection;
        }

        if (
            str_contains($haystack, 'product')
            || str_contains($haystack, 'shop')
            || str_contains($haystack, 'store')
            || str_contains($haystack, 'services')
            || str_contains($haystack, 'service')
        ) {
            return PageType::Products;
        }

        return PageType::Other;
    }
}
