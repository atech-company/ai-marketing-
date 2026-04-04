<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\CrawledPage */
class CrawledPageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'url' => $this->url,
            'page_type' => $this->page_type->value,
            'title' => $this->title,
            'render_method' => $this->render_method->value,
            'extracted_text_preview' => mb_substr($this->extracted_text, 0, 600),
            'images' => $this->images ?? [],
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
