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

class ProcessProjectAnalysisJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 300;

    public function __construct(
        public int $projectId,
    ) {}

    public function handle(WebsiteCrawlService $crawl, MarketingAiService $ai): void
    {
        $project = Project::query()->find($this->projectId);
        if ($project === null) {
            return;
        }

        try {
            $project->update([
                'status' => ProjectStatus::Crawling,
                'error_message' => null,
            ]);

            $crawl->crawl($project);
            $context = $crawl->buildContextDocument($project);

            $project->update(['status' => ProjectStatus::Analyzing]);
            $ai->synthesizeAndStore($project, $context);

            $project->update([
                'status' => ProjectStatus::Completed,
                'error_message' => null,
            ]);

            UsageLog::query()->create([
                'user_id' => $project->user_id,
                'project_id' => $project->id,
                'action' => 'project.analysis_completed',
                'meta_json' => ['project_id' => $project->id],
            ]);
        } catch (Throwable $e) {
            Log::error('Project analysis failed', [
                'project_id' => $project->id,
                'error' => $e->getMessage(),
            ]);

            $project->update([
                'status' => ProjectStatus::Failed,
                'error_message' => $e->getMessage(),
            ]);

            UsageLog::query()->create([
                'user_id' => $project->user_id,
                'project_id' => $project->id,
                'action' => 'project.analysis_failed',
                'meta_json' => [
                    'project_id' => $project->id,
                    'message' => $e->getMessage(),
                ],
            ]);
        }
    }
}
