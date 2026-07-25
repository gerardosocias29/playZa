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
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('facility_id')->constrained()->onDelete('cascade');
            $table->string('event_type')->nullable(); // Graduation, Meeting, Wedding, Birthday, Others
            $table->string('custom_event_name')->nullable(); // e.g. Big Disco Party
            $table->date('reservation_date');
            $table->string('start_time');
            $table->string('end_time');
            $table->integer('duration_hours');
            $table->string('status')->default('approved'); // pending, approved, cancelled, rejected
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
