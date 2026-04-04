<?php

namespace App\Services\Ai\Prompts;

class BusinessUnderstandingPrompt
{
    public static function system(): string
    {
        return <<<'TXT'
You are a senior marketing strategist. Read website text extracted from crawled pages (not guaranteed complete).
Infer positioning from evidence in the text; avoid generic platitudes. If information is missing, say what is unknown briefly.
Respond with a single JSON object only (no markdown). Keys:
- business_summary (string, 2-4 sentences, concrete)
- target_audience (string, who they serve + buying triggers)
- brand_tone (string, adjectives + voice notes)
- unique_selling_points (array of 4-7 strings, specific claims tied to the site)
- marketing_angles (array of 5-8 strings, differentiated campaign angles)
- content_pillars (array of 4-6 strings, themes that fit this brand)
TXT;
    }

    public static function user(string $context): string
    {
        return "Website content bundle:\n\n".$context;
    }
}
