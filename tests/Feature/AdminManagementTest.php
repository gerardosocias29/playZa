<?php

namespace Tests\Feature;

use App\Models\Facility;
use App\Models\Reservation;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'status' => 'approved',
        ]);

        $this->regularUser = User::factory()->create([
            'role' => 'user',
            'status' => 'approved',
        ]);
    }

    public function test_non_admin_cannot_access_admin_routes(): void
    {
        $response = $this->actingAs($this->regularUser)->get(route('admin.dashboard'));
        $response->assertRedirect(route('dashboard'));
    }

    public function test_admin_can_view_dashboard(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.dashboard'));
        $response->assertStatus(200);
    }

    public function test_admin_can_approve_and_reject_users(): void
    {
        $pendingUser = User::factory()->create([
            'role' => 'user',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->admin)->patch(route('admin.users.approve', $pendingUser->id));
        $response->assertSessionHasNoErrors();
        $this->assertEquals('approved', $pendingUser->fresh()->status);

        $response = $this->actingAs($this->admin)->patch(route('admin.users.reject', $pendingUser->id));
        $this->assertEquals('rejected', $pendingUser->fresh()->status);
    }

    public function test_admin_can_create_update_and_delete_facility(): void
    {
        $facilityData = [
            'name' => 'Test Court',
            'type' => 'Indoor',
            'category' => 'Sports',
            'description' => 'Test Court Description',
            'capacity' => 20,
            'requires_event_type' => false,
            'active' => true,
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.facilities.store'), $facilityData);
        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('facilities', ['name' => 'Test Court']);

        $facility = Facility::where('name', 'Test Court')->first();

        $response = $this->actingAs($this->admin)->put(route('admin.facilities.update', $facility->id), array_merge($facilityData, [
            'name' => 'Updated Court',
        ]));
        $this->assertDatabaseHas('facilities', ['name' => 'Updated Court']);

        $response = $this->actingAs($this->admin)->delete(route('admin.facilities.destroy', $facility->id));
        $this->assertDatabaseMissing('facilities', ['id' => $facility->id]);
    }

    public function test_admin_can_approve_reject_and_cancel_reservation(): void
    {
        $facility = Facility::factory()->create();
        $reservation = Reservation::create([
            'user_id' => $this->regularUser->id,
            'facility_id' => $facility->id,
            'reservation_date' => date('Y-m-d', strtotime('+1 day')),
            'start_time' => '10:00',
            'end_time' => '12:00',
            'duration_hours' => 2,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->admin)->patch(route('admin.reservations.approve', $reservation->id));
        $this->assertEquals('approved', $reservation->fresh()->status);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->regularUser->id,
            'type' => 'approval',
        ]);

        $response = $this->actingAs($this->admin)->patch(route('admin.reservations.reject', $reservation->id));
        $this->assertEquals('rejected', $reservation->fresh()->status);
    }
}
