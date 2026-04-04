<?php

namespace App\Services\Ai\Prompts;

class BlogIdeasPrompt
{
    public static function section(): string
    {
        return <<<'TXT'
"blog_ideas": array of exactly 5 objects with keys:
- title (string)
- primary_keyword (string)
- outline (string, bullet-style outline in one string)
TXT;
    }
}
