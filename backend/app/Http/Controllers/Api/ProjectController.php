<?php

namespace App\Http\Controllers\Api;

use App\Enums\ProjectStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\RegenerateProjectRequest;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Jobs\ProcessProjectAnalysisJob;
use App\Jobs\RegenerateProjectJob;
use App\Models\Project;
use App\Services\Crawl\UrlNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $projects = Project::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('updated_at')
            ->paginate(20);

        return ProjectResource::collection($projects)->response();
    }

    public function store(StoreProjectRequest $request, UrlNormalizer $normalizer): JsonResponse
    {
        try {
            $websiteUrl = $normalizer->normalize($request->validated('website_url'));
        } catch (InvalidArgumentException $e) {
            throw ValidationException::withMessages([
                'website_url' => $e->getMessage(),
            ]);
        }

        $project = Project::query()->create([
            'user_id' => $request->user()->id,
            'name' => $request->validated('name'),
            'website_url' => $websiteUrl,
            'status' => ProjectStatus::Pending,
            'error_message' => null,
        ]);

        ProcessProjectAnalysisJob::dispatch($project->id);

        return (new ProjectResource($project))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, Project $project): ProjectResource
    {
        $this->authorize('view', $project);

        $project->load([
            'crawledPages',
            'aiAnalysis',
            'generatedContents',
        ]);

        return new ProjectResource($project);
    }

    public function regenerate(RegenerateProjectRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        if (in_array($project->status, [ProjectStatus::Pending, ProjectStatus::Crawling, ProjectStatus::Analyzing], true)) {
            throw ValidationException::withMessages([
                'project' => 'This project is already processing.',
            ]);
        }

        $scope = $request->validated('scope');
        $nextStatus = $scope === 'crawl' ? ProjectStatus::Crawling : ProjectStatus::Analyzing;
        $project->update([
            'status' => $nextStatus,
            'error_message' => null,
        ]);

        RegenerateProjectJob::dispatch($project->id, $scope);

        return response()->json([
            'message' => 'Regeneration queued.',
        ]);
    }
}
