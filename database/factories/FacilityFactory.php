<?php

namespace Database\Factories;

use App\Models\Facility;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Facility>
 */
class FacilityFactory extends Factory
{
    protected $model = Facility::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(2, true).' Court',
            'type' => 'Indoor',
            'category' => 'Sports',
            'description' => $this->faker->sentence(),
            'capacity' => 50,
            'booking_group' => 'indoor',
            'booking_capacity' => 1,
            'requires_event_type' => false,
            'active' => true,
        ];
    }
}
