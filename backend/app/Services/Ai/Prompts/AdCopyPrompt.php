<?php

namespace App\Services\Ai\Prompts;

class AdCopyPrompt
{
    public static function section(): string
    {
        return <<<'TXT'
"ad_copy": array of exactly 5 objects with keys:
- headline (string)
- primary_text (string)
- cta (string)
TXT;
    }
}
