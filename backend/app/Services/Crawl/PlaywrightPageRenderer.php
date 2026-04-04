<?php

namespace App\Services\Crawl;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

class PlaywrightPageRenderer
{
    public function __construct(
        private readonly UrlNormalizer $urls,
    ) {}

    /**
     * @return array{html: string, title: string}|null
     */
    public function render(string $url): ?array
    {
        $script = config('marketing.playwright.script_path');
        $node = config('marketing.playwright.node_binary');
        $timeout = (int) config('marketing.crawl.playwright_timeout_seconds', 28);

        if (! is_string($script) || ! is_file($script)) {
            Log::warning('Playwright script missing', ['path' => $script]);

            return null;
        }

        $result = Process::timeout($timeout + 5)->run([
            (string) $node,
            $script,
            $url,
        ]);

        if (! $result->successful()) {
            Log::warning('Playwright render failed', [
                'url' => $url,
                'exit' => $result->exitCode(),
                'err' => $result->errorOutput(),
            ]);

            return null;
        }

        $decoded = json_decode($result->output(), true);
        if (! is_array($decoded) || ! isset($decoded['html']) || ! is_string($decoded['html'])) {
            Log::warning('Playwright invalid JSON output', ['url' => $url]);

            return null;
        }

        $maxBytes = (int) config('marketing.crawl.max_html_bytes', 2_500_000);
        $html = $decoded['html'];
        if (strlen($html) > $maxBytes) {
            $html = substr($html, 0, $maxBytes);
        }

        return [
            'html' => $html,
            'title' => is_string($decoded['title'] ?? null) ? $decoded['title'] : '',
        ];
    }
}
