<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Multi-day bookings: `reservation_date` is the first day, `end_date` the last
     * (inclusive). Single-day rows carry the same value in both.
     */
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->date('end_date')->nullable()->after('reservation_date');
        });

        DB::table('reservations')->update(['end_date' => DB::raw('reservation_date')]);
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn('end_date');
        });
    }
};
