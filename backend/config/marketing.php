<?php

return [

    'crawl' => [
        'max_pages' => (int) env('CRAWL_MAX_PAGES', 8),
        'http_timeout_seconds' => (int) env('CRAWL_HTTP_TIMEOUT', 15),
        'playwright_timeout_seconds' => (int) env('CRAWL_PLAYWRIGHT_TIMEOUT', 28),
        'min_text_chars_for_http' => (int) env('CRAWL_MIN_TEXT_CHARS', 400),
        'verify_ssl' => filter_var(env('CRAWL_VERIFY_SSL', true), FILTER_VALIDATE_BOOL),
        'user_agent' => env(
            'CRAWL_USER_AGENT',
            'AIMarketingDiscoveryBot/1.0 (+https://example.com/bot)'
        ),
        'max_html_bytes' => (int) env('CRAWL_MAX_HTML_BYTES', 2_500_000),
        'max_images_per_page' => (int) env('CRAWL_MAX_IMAGES_PER_PAGE', 12),
    ],

    'ai' => [
        'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
        'max_context_chars' => (int) env('AI_MAX_CONTEXT_CHARS', 24_000),
    ],

    'playwright' => [
        'node_binary' => env('PLAYWRIGHT_NODE_BINARY', 'node'),
        'script_path' => env(
            'PLAYWRIGHT_SCRIPT_PATH',
            base_path('playwright-runner/render.mjs')
        ),
    ],

];
