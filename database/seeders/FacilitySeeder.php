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
                'description' => 'Climate-controlled indoor hardwood court with electronic scoreboards, shot clocks, and spectator stands.',
                'requires_event_type' => false,
                'active' => true,
                'images' => [
                    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=800&q=80'
                ]
            ],
            [
                'name' => 'Volleyball',
                'type' => 'Indoor',
                'category' => 'Sports',
                'description' => 'Professional indoor volleyball court with high-grade synthetic floor, adjustable net tensioning, and referee chair.',
                'requires_event_type' => false,
                'active' => true,
                'images' => [
                    'https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'
                ]
            ],
            [
                'name' => 'Tennis',
                'type' => 'Outdoor',
                'category' => 'Sports',
                'description' => 'Premium outdoor clay tennis court featuring baseline markings, high-tensile net, and surrounding windbreaks.',
                'requires_event_type' => false,
                'active' => true,
                'images' => [
                    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1530915534664-4ac642378097?auto=format&fit=crop&w=800&q=80'
                ]
            ],
            [
                'name' => 'Table Tennis',
                'type' => 'Indoor',
                'category' => 'Sports',
                'description' => 'ITTF-approved indoor table tennis arena equipped with tournament tables, non-slip flooring, and ball barriers.',
                'requires_event_type' => false,
                'active' => true,
                'images' => [
                    'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?auto=format&fit=crop&w=800&q=80'
                ]
            ],
            [
                'name' => 'Badminton',
                'type' => 'Indoor',
                'category' => 'Sports',
                'description' => 'Dedicated indoor badminton court with green PVC matting, anti-glare overhead lighting, and net posts.',
                'requires_event_type' => false,
                'active' => true,
                'images' => [
                    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1521537634581-0dced2efa2a3?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&w=800&q=80'
                ]
            ],
            [
                'name' => 'Special Events',
                'type' => 'Indoor',
                'category' => 'Events',
                'description' => 'Adaptable hall for custom events. Select event types like Graduation, Meeting, Wedding, Birthday, or specify custom events (e.g. Big Disco Party).',
                'requires_event_type' => true,
                'active' => true,
                'images' => [
                    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'
                ]
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
