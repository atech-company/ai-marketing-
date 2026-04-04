<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\GeneratedContent */
class GeneratedContentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'content_type' => $this->content_type->value,
            'title' => $this->title,
            'content' => $this->content,
            'meta' => $this->meta_json,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
