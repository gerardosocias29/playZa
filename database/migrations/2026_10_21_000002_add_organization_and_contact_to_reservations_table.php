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
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('organization_or_school')->nullable()->after('custom_event_name');
            $table->string('contact_person')->nullable()->after('organization_or_school');
            $table->string('contact_number')->nullable()->after('contact_person');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['organization_or_school', 'contact_person', 'contact_number']);
        });
    }
};
