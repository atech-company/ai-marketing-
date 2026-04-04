<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GenerateSocialTemplatesRequest;
use App\Services\Ai\SocialMediaTemplateService;
use App\Services\Crawl\UrlNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;
use Throwable;

class SocialTemplatesController extends Controller
{
    public function store(
        GenerateSocialTemplatesRequest $request,
        UrlNormalizer $normalizer,
        SocialMediaTemplateService $templates,
    ): JsonResponse {
        try {
            $normalized = $normalizer->normalize($request->validated('url'));
        } catch (InvalidArgumentException $e) {
            throw ValidationException::withMessages([
                'url' => $e->getMessage(),
            ]);
        }

        try {
            $data = $templates->generate(
                $normalized,
                $request->validated('item_label'),
                $request->validated('notes'),
                $request->user()->id,
            );
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json(['data' => $data]);
    }
}
