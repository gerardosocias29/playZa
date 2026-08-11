<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('facilities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type')->default('Indoor'); // Indoor or Outdoor
            $table->string('category')->default('Sports'); // Sports or Events
            $table->text('description')->nullable();
            $table->integer('capacity')->default(50);
            $table->json('images')->nullable();
            $table->string('booking_group')->nullable()->default('indoor');
            $table->unsignedTinyInteger('booking_capacity')->nullable()->default(1);
            $table->boolean('active')->default(true);
            $table->boolean('requires_event_type')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facilities');
    }
};
