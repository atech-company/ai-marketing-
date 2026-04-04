<?php

namespace App\Models;

use App\Enums\PageType;
use App\Enums\RenderMethod;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'project_id',
    'url',
    'page_type',
    'title',
    'raw_html',
    'extracted_text',
    'images',
    'render_method',
])]
class CrawledPage extends Model
{
    protected function casts(): array
    {
        return [
            'page_type' => PageType::class,
            'render_method' => RenderMethod::class,
            'images' => 'array',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
