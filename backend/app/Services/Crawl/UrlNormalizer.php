<?php

namespace App\Services\Crawl;

use Illuminate\Support\Str;
use InvalidArgumentException;

class UrlNormalizer
{
    public function normalize(string $input): string
    {
        $trimmed = trim($input);
        if ($trimmed === '') {
            throw new InvalidArgumentException('URL is required.');
        }

        if (! Str::startsWith($trimmed, ['http://', 'https://'])) {
            $trimmed = 'https://'.$trimmed;
        }

        $parts = parse_url($trimmed);
        if ($parts === false || empty($parts['scheme']) || empty($parts['host'])) {
            throw new InvalidArgumentException('Invalid URL.');
        }

        $scheme = strtolower($parts['scheme']);
        if (! in_array($scheme, ['http', 'https'], true)) {
            throw new InvalidArgumentException('Only HTTP and HTTPS URLs are supported.');
        }

        $host = strtolower($parts['host']);

        $path = $parts['path'] ?? '';
        $query = isset($parts['query']) ? '?'.$parts['query'] : '';
        $fragment = isset($parts['fragment']) ? '#'.$parts['fragment'] : '';

        $port = isset($parts['port']) ? ':'.$parts['port'] : '';

        return $scheme.'://'.$host.$port.$path.$query.$fragment;
    }

    public function origin(string $url): string
    {
        $parts = parse_url($url);
        if ($parts === false || empty($parts['scheme']) || empty($parts['host'])) {
            throw new InvalidArgumentException('Invalid URL.');
        }

        $port = isset($parts['port']) ? ':'.$parts['port'] : '';

        return strtolower($parts['scheme']).'://'.strtolower($parts['host']).$port;
    }

    public function registrableHost(string $url): string
    {
        $host = strtolower(parse_url($url, PHP_URL_HOST) ?: '');
        if ($host === '') {
            throw new InvalidArgumentException('Invalid URL host.');
        }

        return Str::startsWith($host, 'www.') ? substr($host, 4) : $host;
    }

    public function isSameSite(string $baseUrl, string $candidateUrl): bool
    {
        try {
            return $this->registrableHost($baseUrl) === $this->registrableHost($candidateUrl);
        } catch (InvalidArgumentException) {
            return false;
        }
    }
}
