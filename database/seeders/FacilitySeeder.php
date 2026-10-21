<?php

namespace Database\Seeders;

use App\Models\Facility;
use Illuminate\Database\Seeder;

class FacilitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $facilities = [
            [
                'name' => 'Basketball',
                'type' => 'Indoor',
                'category' => 'Sports',
                'description' => 'Indoor basketball court with hardwood floor and game lighting, ideal for intramurals and tournaments.',
                'requires_event_type' => true,
                'event_options' => ['Intramurals', 'Tournament', 'Exhibition Match', 'Others'],
                'allow_custom_event_name' => true,
                'max_hours' => 9,
                'active' => true,
                'booking_group' => 'indoor',
                'booking_capacity' => 1,
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'images' => [
                    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=800&q=80',
                ],
            ],
            [
                'name' => 'Pickleball',
                'type' => 'Outdoor',
                'category' => 'Sports',
                'description' => 'Outdoor pickleball court built for fast rallies and all-day play.',
                'requires_event_type' => false,
                'active' => true,
                'booking_group' => 'outdoor',
                'booking_capacity' => 2,
                'opening_time' => '06:00',
                'closing_time' => '21:00',
                'images' => [
                    'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
                ],
            ],
            [
                'name' => 'Tennis',
                'type' => 'Outdoor',
                'category' => 'Sports',
                'description' => 'Outdoor tennis courts for singles and doubles play across the day.',
                'requires_event_type' => false,
                'active' => true,
                'booking_group' => 'outdoor',
                'booking_capacity' => 2,
                'opening_time' => '06:00',
                'closing_time' => '21:00',
                'images' => [
                    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1530915534664-4ac642378097?auto=format&fit=crop&w=800&q=80',
                ],
            ],
        ];

        foreach ($facilities as $facilityData) {
            Facility::updateOrCreate(
                ['name' => $facilityData['name']],
                $facilityData
            );
        }
    }
}
