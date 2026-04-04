<?php

namespace App\Enums;

enum RenderMethod: string
{
    case Http = 'http';
    case Playwright = 'playwright';
}
