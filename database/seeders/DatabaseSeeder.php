<?php

namespace Database\Seeders;

use App\Models\Facility;
use App\Models\Notification;
use App\Models\Reservation;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@playza.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'status' => 'approved',
            ]
        );

        $user = User::updateOrCreate(
            ['email' => 'user@playza.com'],
            [
                'name' => 'Regular User',
                'password' => Hash::make('user123'),
                'role' => 'user',
                'status' => 'approved',
            ]
        );

        User::updateOrCreate(
            ['email' => 'pending@playza.com'],
            [
                'name' => 'Pending User',
                'password' => Hash::make('pending123'),
                'role' => 'user',
                'status' => 'pending',
            ]
        );

        User::updateOrCreate(
            ['email' => 'rejected@playza.com'],
            [
                'name' => 'Rejected User',
                'password' => Hash::make('rejected123'),
                'role' => 'user',
                'status' => 'rejected',
            ]
        );

        $this->call(FacilitySeeder::class);

        $basketball = Facility::where('name', 'Basketball')->first();
        $todayStr = date('Y-m-d');

        if ($basketball) {
            $res1 = Reservation::create([
                'user_id' => $user->id,
                'facility_id' => $basketball->id,
                'reservation_date' => $todayStr,
                'start_time' => '10:00',
                'end_time' => '12:00',
                'duration_hours' => 2,
                'status' => 'approved',
            ]);

            Notification::create([
                'user_id' => $user->id,
                'reservation_id' => $res1->id,
                'type' => 'approval',
                'message' => "Your reservation for Basketball on {$todayStr} (10:00 - 12:00) has been APPROVED.",
                'is_read' => false,
            ]);

            Schedule::create([
                'facility_id' => $basketball->id,
                'date' => $todayStr,
                'start_time' => '10:00',
                'end_time' => '12:00',
                'status' => 'blocked',
            ]);
        }
    }
}
