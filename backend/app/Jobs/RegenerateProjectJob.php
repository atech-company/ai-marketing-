<?php

namespace App\Jobs;

use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\UsageLog;
use App\Services\Ai\MarketingAiService;
use App\Services\Crawl\WebsiteCrawlService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class RegenerateProjectJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 300;

    public function __construct(
        public int $projectId,
        public string $scope,
    ) {}

    public function handle(WebsiteCrawlService $crawl, MarketingAiService $ai): void
    {
        $project = Project::query()->find($this->projectId);
        if ($project === null) {
            return;
        }

        try {
            if ($this->scope === 'crawl') {
                $project->update([
                    'status' => ProjectStatus::Crawling,
                    'error_message' => null,
                ]);
                $project->aiAnalysis()->delete();
                $project->generatedContents()->delete();
                $crawl->crawl($project);
            }

            $project->update([
                'status' => ProjectStatus::Analyzing,
                'error_message' => null,
            ]);

            $context = $crawl->buildContextDocument($project);

            if ($this->scope === 'content') {
                $ai->regenerateContentOnly($project, $context);
            } elseif ($this->scope === 'crawl') {
                $ai->synthesizeAndStore($project, $context);
            } else {
                $ai->regenerateAnalysis($project, $context);
            }

            $project->update([
                'status' => ProjectStatus::Completed,
                'error_message' => null,
            ]);

            UsageLog::query()->create([
                'user_id' => $project->user_id,
                'project_id' => $project->id,
                'action' => 'project.regenerated',
                'meta_json' => ['scope' => $this->scope],
            ]);
        } catch (Throwable $e) {
            Log::error('Project regeneration failed', [
                'project_id' => $project->id,
                'scope' => $this->scope,
                'error' => $e->getMessage(),
            ]);

            $project->update([
                'status' => ProjectStatus::Failed,
                'error_message' => $e->getMessage(),
            ]);
        }
    }
}
