<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Project */
class ProjectResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'website_url' => $this->website_url,
            'status' => $this->status->value,
            'error_message' => $this->error_message,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'crawled_pages' => CrawledPageResource::collection($this->whenLoaded('crawledPages')),
            'ai_analysis' => $this->when(
                $this->relationLoaded('aiAnalysis') && $this->aiAnalysis !== null,
                fn () => new AiAnalysisResource($this->aiAnalysis),
            ),
            'generated_contents' => GeneratedContentResource::collection($this->whenLoaded('generatedContents')),
        ];
    }
}
