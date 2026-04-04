<?php

namespace App\Services\Crawl;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;

class HttpPageFetcher
{
    public function __construct(
        private readonly UrlNormalizer $urls,
    ) {}

    /**
     * @return array{html: string, final_url: string}|null
     */
    public function fetch(string $url): ?array
    {
        $timeout = (int) config('marketing.crawl.http_timeout_seconds', 15);
        $verify = (bool) config('marketing.crawl.verify_ssl', true);
        $ua = (string) config('marketing.crawl.user_agent');
        $maxBytes = (int) config('marketing.crawl.max_html_bytes', 2_500_000);

        $client = new Client([
            'timeout' => $timeout,
            'connect_timeout' => min(10, $timeout),
            'verify' => $verify,
            'http_errors' => false,
            'allow_redirects' => [
                'max' => 5,
                'strict' => true,
                'referer' => true,
                'track_redirects' => true,
            ],
            'headers' => [
                'User-Agent' => $ua,
                'Accept' => 'text/html,application/xhtml+xml',
                'Accept-Language' => 'en-US,en;q=0.9',
            ],
        ]);

        try {
            $response = $client->get($url);
        } catch (GuzzleException $e) {
            Log::warning('HTTP crawl failed', ['url' => $url, 'error' => $e->getMessage()]);

            return null;
        }

        $status = $response->getStatusCode();
        if ($status < 200 || $status >= 400) {
            Log::warning('HTTP crawl bad status', ['url' => $url, 'status' => $status]);

            return null;
        }

        $body = (string) $response->getBody();
        if (strlen($body) > $maxBytes) {
            $body = substr($body, 0, $maxBytes);
        }

        return [
            'html' => $body,
            'final_url' => $this->urls->normalize($url),
        ];
    }
}
