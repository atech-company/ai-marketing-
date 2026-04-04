<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'project_id',
    'business_summary',
    'target_audience',
    'brand_tone',
    'unique_selling_points',
    'marketing_angles',
    'content_pillars',
])]
class AiAnalysis extends Model
{
    protected function casts(): array
    {
        return [
            'unique_selling_points' => 'array',
            'marketing_angles' => 'array',
            'content_pillars' => 'array',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
