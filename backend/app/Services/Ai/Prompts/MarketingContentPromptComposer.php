<?php

namespace App\Services\Ai\Prompts;

class MarketingContentPromptComposer
{
    public static function system(): string
    {
        $blocks = [
            ContentIdeasPrompt::section(),
            SocialPostsPrompt::section(),
            AdCopyPrompt::section(),
            BlogIdeasPrompt::section(),
            HomepageSuggestionsPrompt::section(),
        ];

        return "You are a creative director and performance marketer. Using the website text and the analysis snapshot, produce concrete, non-generic ideas.\n"
            ."Respond with a single JSON object only (no markdown) containing exactly these top-level keys:\n"
            .implode("\n", $blocks);
    }

    /**
     * @param  array<string, mixed>  $analysis
     */
    public static function user(string $context, array $analysis): string
    {
        $snapshot = json_encode($analysis, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);

        return "Website content bundle:\n\n{$context}\n\nAnalysis snapshot (JSON):\n{$snapshot}";
    }
}
