<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('generated_contents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('content_type', 64)->index();
            $table->string('title')->nullable();
            $table->longText('content');
            $table->json('meta_json')->nullable();
            $table->timestamps();

            $table->index(['project_id', 'content_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('generated_contents');
    }
};
