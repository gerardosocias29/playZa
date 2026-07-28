<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('facilities', function (Blueprint $table) {
            $table->json('event_options')->nullable()->after('requires_event_type');
            $table->boolean('allow_custom_event_name')->default(true)->after('event_options');
        });
    }

    public function down(): void
    {
        Schema::table('facilities', function (Blueprint $table) {
            $table->dropColumn(['event_options', 'allow_custom_event_name']);
        });
    }
};
