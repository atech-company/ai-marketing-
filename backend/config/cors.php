<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    /*
     * Explicit origins: browsers require Access-Control-Allow-Origin on preflight (OPTIONS).
     * Wildcard * is unreliable with some hosts/proxies and must not be used with credentials.
     * Comma-separated list in .env, e.g. CORS_ALLOWED_ORIGINS=https://ai.atechleb.com,http://localhost:3000
     */
    'allowed_origins' => collect(explode(',', (string) env(
        'CORS_ALLOWED_ORIGINS',
        'http://localhost:3000,http://127.0.0.1:3000,https://ai.atechleb.com',
    )))
        ->map(fn (string $o) => trim($o))
        ->filter()
        ->values()
        ->all(),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
