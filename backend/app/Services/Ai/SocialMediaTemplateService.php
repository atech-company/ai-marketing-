<?php

namespace App\Services\Ai;

use App\Models\UsageLog;
use App\Services\Ai\Prompts\SocialMediaTemplatesPrompt;
use App\Services\Crawl\HttpPageFetcher;
use App\Services\Crawl\HtmlTextExtractor;
use App\Services\Crawl\PageImageExtractor;
use App\Services\Crawl\PlaywrightPageRenderer;
use App\Services\Crawl\UrlNormalizer;
use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;
use RuntimeException;

class SocialMediaTemplateService
{
    public function __construct(
        private readonly UrlNormalizer $urls,
        private readonly HttpPageFetcher $http,
        private readonly PlaywrightPageRenderer $playwright,
        private readonly HtmlTextExtractor $extractor,
        private readonly PageImageExtractor $imageExtractor,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function generate(string $url, ?string $itemLabel, ?string $notes, int $userId): array
    {
        $normalized = $this->urls->normalize($url);
        $minChars = (int) config('marketing.crawl.min_text_chars_for_http', 400);
        $maxContext = min(14_000, (int) config('marketing.ai.max_context_chars', 24_000));

        $page = $this->fetchPage($normalized, $minChars);
        $text = $page['text'];
        $images = $page['images'];

        if (trim($text) === '') {
            throw new RuntimeException('Could not extract readable text from this URL. It may block bots or need a public page.');
        }

        $pageContext = mb_substr($text, 0, $maxContext);
        if (mb_strlen($text) > $maxContext) {
            $pageContext .= "\n\n[TRUNCATED]";
        }

        $imageUrls = array_values(array_map(fn (array $i) => $i['url'], $images));

        $pack = $this->chatJson(
            SocialMediaTemplatesPrompt::system(),
            SocialMediaTemplatesPrompt::user($normalized, $pageContext, $itemLabel, $notes, $imageUrls),
        );

        UsageLog::query()->create([
            'user_id' => $userId,
            'project_id' => null,
            'action' => 'social_templates.generated',
            'meta_json' => [
                'source_url' => $normalized,
                'has_item_label' => $itemLabel !== null && $itemLabel !== '',
                'image_count' => count($images),
            ],
        ]);

        return array_merge($pack, [
            'source_url' => $normalized,
            'images' => $images,
        ]);
    }

    /**
     * @return array{text: string, html: string, images: list<array{url: string, alt: ?string, kind: string}>}
     */
    private function fetchPage(string $normalized, int $minChars): array
    {
        $html = null;
        $text = null;

        $fetch = $this->http->fetch($normalized);
        if ($fetch !== null) {
            $html = $fetch['html'];
            $text = $this->extractor->extract($html);
            if (mb_strlen($text) < $minChars) {
                $rendered = $this->playwright->render($normalized);
                if ($rendered !== null) {
                    $html = $rendered['html'];
                    $text = $this->extractor->extract($html);
                }
            }
        } else {
            $rendered = $this->playwright->render($normalized);
            if ($rendered !== null) {
                $html = $rendered['html'];
                $text = $this->extractor->extract($html);
            }
        }

        if ($html === null) {
            return ['text' => '', 'html' => '', 'images' => []];
        }

        $images = $this->imageExtractor->extract($html, $normalized);

        return [
            'text' => $text ?? '',
            'html' => $html,
            'images' => $images,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function chatJson(string $system, string $user): array
    {
        $model = (string) config('marketing.ai.model', 'gpt-4o-mini');

        $response = OpenAI::chat()->create([
            'model' => $model,
            'temperature' => 0.55,
            'response_format' => ['type' => 'json_object'],
            'messages' => [
                ['role' => 'system', 'content' => $system],
                ['role' => 'user', 'content' => $user],
            ],
        ]);

        $content = $response->choices[0]->message->content ?? '';
        if (! is_string($content) || trim($content) === '') {
            throw new RuntimeException('Empty response from AI.');
        }

        return $this->decodeJsonObject($content);
    }

    /**
     * @return array<string, mixed>
     */
    private function decodeJsonObject(string $raw): array
    {
        $trimmed = trim($raw);
        if (preg_match('/^```(?:json)?\s*(.*?)\s*```$/s', $trimmed, $m)) {
            $trimmed = trim((string) $m[1]);
        }

        try {
            $data = json_decode($trimmed, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            Log::error('Social templates JSON parse failed', ['error' => $e->getMessage()]);

            throw new RuntimeException('Could not parse structured AI output.');
        }

        if (! is_array($data)) {
            throw new RuntimeException('AI returned invalid JSON shape.');
        }

        return $data;
    }
}
