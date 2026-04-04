<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->text('business_summary')->nullable();
            $table->text('target_audience')->nullable();
            $table->text('brand_tone')->nullable();
            $table->json('unique_selling_points')->nullable();
            $table->json('marketing_angles')->nullable();
            $table->json('content_pillars')->nullable();
            $table->timestamps();

            $table->unique('project_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_analyses');
    }
};
