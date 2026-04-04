<?php

namespace App\Services\Ai\Prompts;

class SocialMediaTemplatesPrompt
{
    public static function system(): string
    {
        return <<<'TXT'
You are a social media strategist. Given page text from a product or content URL (and optional user notes), write ready-to-paste templates for each platform.

Rules:
- Base copy on the provided text; do not invent discounts or claims not supported by the page.
- Respect typical limits: X/Twitter main field ≤ 270 characters (leave room). Instagram caption can be longer. LinkedIn: professional, line breaks OK.
- Include platform-native patterns (e.g. Instagram: caption + 5–12 relevant hashtags as array; Pinterest: searchable title).
- Output a single JSON object only (no markdown). Use exactly these top-level keys:
  - instagram: { "caption": string, "hashtags": array of strings (without # prefix in array), "cta": string }
  - facebook: { "post": string }
  - linkedin: { "post": string }
  - x_twitter: { "tweet": string (≤270 chars), "reply_hook": string optional follow-up }
  - threads: { "post": string }
  - tiktok: { "on_screen_hook": string (short), "caption": string, "hashtags": array of strings }
  - pinterest: { "title": string (≤100 chars), "description": string }
  - youtube_shorts: { "title": string (≤100 chars), "description": string, "hashtags": array of strings }

All string values must be non-empty when the page has enough substance; if the page is thin, still produce best-effort hooks and mark uncertainty briefly inside the copy (one short phrase), not in meta.
TXT;
    }

    /**
     * @param  list<string>  $imageUrls
     */
    public static function user(string $sourceUrl, string $pageContext, ?string $itemLabel, ?string $notes, array $imageUrls = []): string
    {
        $parts = ["Source URL: {$sourceUrl}", 'Extracted page text (may be truncated):', $pageContext];
        if ($itemLabel !== null && $itemLabel !== '') {
            $parts[] = 'User label for this item (product/page name): '.$itemLabel;
        }
        if ($notes !== null && $notes !== '') {
            $parts[] = 'Extra notes from user: '.$notes;
        }
        if ($imageUrls !== []) {
            $slice = array_slice($imageUrls, 0, 15);
            $parts[] = "Image URLs detected on the page (use when suggesting visual hooks or 'see photo' style cues):\n".implode("\n", $slice);
        }

        return implode("\n\n", $parts);
    }
}
