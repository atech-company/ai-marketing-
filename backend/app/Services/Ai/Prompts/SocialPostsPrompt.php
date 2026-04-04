<?php

namespace App\Services\Ai\Prompts;

class SocialPostsPrompt
{
    public static function section(): string
    {
        return <<<'TXT'
"social_posts": array of exactly 10 objects with keys:
- platform (string)
- hook (string, first line)
- body (string, 2-4 short paragraphs max)
TXT;
    }
}
