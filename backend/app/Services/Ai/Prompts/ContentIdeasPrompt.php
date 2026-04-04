<?php

namespace App\Services\Ai\Prompts;

class ContentIdeasPrompt
{
    public static function section(): string
    {
        return <<<'TXT'
"content_ideas": array of exactly 20 objects with keys:
- title (string)
- angle (string, why it fits this brand)
- format (string, e.g. short video, carousel, email, landing section)
TXT;
    }
}
