<?php

namespace App\Services\Ai\Prompts;

class HomepageSuggestionsPrompt
{
    public static function section(): string
    {
        return <<<'TXT'
"homepage_suggestions": array of exactly 3 objects with keys:
- area (string, e.g. hero, social proof, offer clarity)
- suggestion (string, actionable)
- rationale (string, why it should lift conversion or clarity)
TXT;
    }
}
