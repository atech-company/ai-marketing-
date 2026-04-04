<?php

namespace App\Services\Ai;

use App\Enums\GeneratedContentType;
use App\Models\AiAnalysis;
use App\Models\GeneratedContent;
use App\Models\Project;
use App\Services\Ai\Prompts\BusinessUnderstandingPrompt;
use App\Services\Ai\Prompts\MarketingContentPromptComposer;
use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;
use RuntimeException;

class MarketingAiService
{
    public function synthesizeAndStore(Project $project, string $contextDocument): void
    {
        $analysis = $this->runBusinessUnderstanding($project, $contextDocument);
        $this->runAndStoreContentPack($project, $contextDocument, $analysis);
    }

    public function regenerateAnalysis(Project $project, string $contextDocument): void
    {
        $project->generatedContents()->delete();
        $project->aiAnalysis()->delete();

        $analysis = $this->runBusinessUnderstanding($project, $contextDocument);
        $this->runAndStoreContentPack($project, $contextDocument, $analysis);
    }

    public function regenerateContentOnly(Project $project, string $contextDocument): void
    {
        $analysisModel = $project->aiAnalysis;
        if ($analysisModel === null) {
            throw new RuntimeException('Analysis is missing; run a full analysis first.');
        }

        $project->generatedContents()->delete();
        $this->runAndStoreContentPack($project, $contextDocument, $this->analysisToArray($analysisModel));
    }

    /**
     * @return array<string, mixed>
     */
    private function analysisToArray(AiAnalysis $a): array
    {
        return [
            'business_summary' => $a->business_summary,
            'target_audience' => $a->target_audience,
            'brand_tone' => $a->brand_tone,
            'unique_selling_points' => $a->unique_selling_points ?? [],
            'marketing_angles' => $a->marketing_angles ?? [],
            'content_pillars' => $a->content_pillars ?? [],
        ];
    }

    private function runBusinessUnderstanding(Project $project, string $contextDocument): array
    {
        $payload = $this->chatJson(
            BusinessUnderstandingPrompt::system(),
            BusinessUnderstandingPrompt::user($contextDocument),
        );

        AiAnalysis::query()->updateOrCreate(
            ['project_id' => $project->id],
            [
                'business_summary' => (string) ($payload['business_summary'] ?? ''),
                'target_audience' => (string) ($payload['target_audience'] ?? ''),
                'brand_tone' => (string) ($payload['brand_tone'] ?? ''),
                'unique_selling_points' => $this->stringList($payload['unique_selling_points'] ?? []),
                'marketing_angles' => $this->stringList($payload['marketing_angles'] ?? []),
                'content_pillars' => $this->stringList($payload['content_pillars'] ?? []),
            ],
        );

        return [
            'business_summary' => (string) ($payload['business_summary'] ?? ''),
            'target_audience' => (string) ($payload['target_audience'] ?? ''),
            'brand_tone' => (string) ($payload['brand_tone'] ?? ''),
            'unique_selling_points' => $this->stringList($payload['unique_selling_points'] ?? []),
            'marketing_angles' => $this->stringList($payload['marketing_angles'] ?? []),
            'content_pillars' => $this->stringList($payload['content_pillars'] ?? []),
        ];
    }

    /**
     * @param  array<string, mixed>  $analysis
     */
    private function runAndStoreContentPack(Project $project, string $contextDocument, array $analysis): void
    {
        $payload = $this->chatJson(
            MarketingContentPromptComposer::system(),
            MarketingContentPromptComposer::user($contextDocument, $analysis),
        );

        $rows = [];

        foreach ($this->normalizeList($payload['content_ideas'] ?? []) as $item) {
            if (! is_array($item)) {
                continue;
            }
            $title = (string) ($item['title'] ?? 'Content idea');
            $rows[] = [
                'content_type' => GeneratedContentType::ContentIdea,
                'title' => mb_substr($title, 0, 255),
                'content' => trim((string) ($item['angle'] ?? '')."\n\nFormat: ".(string) ($item['format'] ?? '')),
                'meta_json' => $item,
            ];
        }

        foreach ($this->normalizeList($payload['social_posts'] ?? []) as $item) {
            if (! is_array($item)) {
                continue;
            }
            $rows[] = [
                'content_type' => GeneratedContentType::SocialPost,
                'title' => mb_substr((string) ($item['platform'] ?? 'Social'), 0, 255),
                'content' => trim((string) ($item['hook'] ?? '')."\n\n".(string) ($item['body'] ?? '')),
                'meta_json' => $item,
            ];
        }

        foreach ($this->normalizeList($payload['ad_copy'] ?? []) as $item) {
            if (! is_array($item)) {
                continue;
            }
            $rows[] = [
                'content_type' => GeneratedContentType::AdCopy,
                'title' => mb_substr((string) ($item['headline'] ?? 'Ad'), 0, 255),
                'content' => trim((string) ($item['primary_text'] ?? '')."\n\nCTA: ".(string) ($item['cta'] ?? '')),
                'meta_json' => $item,
            ];
        }

        foreach ($this->normalizeList($payload['blog_ideas'] ?? []) as $item) {
            if (! is_array($item)) {
                continue;
            }
            $rows[] = [
                'content_type' => GeneratedContentType::BlogIdea,
                'title' => mb_substr((string) ($item['title'] ?? 'Blog'), 0, 255),
                'content' => trim('Keyword: '.(string) ($item['primary_keyword'] ?? '')."\n\n".(string) ($item['outline'] ?? '')),
                'meta_json' => $item,
            ];
        }

        foreach ($this->normalizeList($payload['homepage_suggestions'] ?? []) as $item) {
            if (! is_array($item)) {
                continue;
            }
            $rows[] = [
                'content_type' => GeneratedContentType::HomepageSuggestion,
                'title' => mb_substr((string) ($item['area'] ?? 'Homepage'), 0, 255),
                'content' => trim((string) ($item['suggestion'] ?? '')."\n\nWhy: ".(string) ($item['rationale'] ?? '')),
                'meta_json' => $item,
            ];
        }

        foreach ($rows as $row) {
            GeneratedContent::query()->create([
                'project_id' => $project->id,
                'content_type' => $row['content_type'],
                'title' => $row['title'],
                'content' => $row['content'],
                'meta_json' => $row['meta_json'],
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function chatJson(string $system, string $user): array
    {
        $model = (string) config('marketing.ai.model', 'gpt-4o-mini');

        $response = OpenAI::chat()->create([
            'model' => $model,
            'temperature' => 0.65,
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
            Log::error('AI JSON parse failed', ['snippet' => mb_substr($trimmed, 0, 500), 'error' => $e->getMessage()]);
            throw new RuntimeException('Could not parse structured AI output.');
        }

        if (! is_array($data)) {
            throw new RuntimeException('AI returned invalid JSON shape.');
        }

        return $data;
    }

    /**
     * @param  mixed  $value
     * @return list<string>
     */
    private function stringList(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        $out = [];
        foreach ($value as $item) {
            if (is_string($item) && trim($item) !== '') {
                $out[] = trim($item);
            }
        }

        return $out;
    }

    /**
     * @param  mixed  $value
     * @return list<mixed>
     */
    private function normalizeList(mixed $value): array
    {
        return is_array($value) ? array_values($value) : [];
    }
}
