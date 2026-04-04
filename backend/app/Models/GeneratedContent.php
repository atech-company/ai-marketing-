<?php

namespace App\Models;

use App\Enums\GeneratedContentType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'project_id',
    'content_type',
    'title',
    'content',
    'meta_json',
])]
class GeneratedContent extends Model
{
    protected function casts(): array
    {
        return [
            'content_type' => GeneratedContentType::class,
            'meta_json' => 'array',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
