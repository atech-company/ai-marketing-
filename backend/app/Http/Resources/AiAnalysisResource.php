<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\AiAnalysis */
class AiAnalysisResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'business_summary' => $this->business_summary,
            'target_audience' => $this->target_audience,
            'brand_tone' => $this->brand_tone,
            'unique_selling_points' => $this->unique_selling_points ?? [],
            'marketing_angles' => $this->marketing_angles ?? [],
            'content_pillars' => $this->content_pillars ?? [],
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
