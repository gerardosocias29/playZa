<?php

namespace Tests\Feature;

use App\Models\Facility;
use App\Models\Notification;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserReservationTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Facility $facility;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'role' => 'user',
            'status' => 'approved',
        ]);

        $this->facility = Facility::factory()->create([
            'name' => 'Basketball Arena',
            'active' => true,
        ]);
    }

    public function test_user_can_submit_reservation(): void
    {
        $date = date('Y-m-d', strtotime('+2 days'));

        $response = $this->actingAs($this->user)->post(route('reservations.store'), [
            'facility_id' => $this->facility->id,
            'reservation_date' => $date,
            'start_time' => '14:00',
            'end_time' => '16:00',
            'duration_hours' => 2,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('reservations', [
            'user_id' => $this->user->id,
            'facility_id' => $this->facility->id,
            'reservation_date' => $date,
            'status' => 'pending',
        ]);
    }

    public function test_double_booking_conflict_is_rejected(): void
    {
        $date = date('Y-m-d', strtotime('+2 days'));

        Reservation::create([
            'user_id' => $this->user->id,
            'facility_id' => $this->facility->id,
            'reservation_date' => $date,
            'start_time' => '14:00',
            'end_time' => '16:00',
            'duration_hours' => 2,
            'status' => 'approved',
        ]);

        $anotherUser = User::factory()->create(['role' => 'user', 'status' => 'approved']);

        // Try booking overlapping slot 15:00 - 17:00
        $response = $this->actingAs($anotherUser)->post(route('reservations.store'), [
            'facility_id' => $this->facility->id,
            'reservation_date' => $date,
            'start_time' => '15:00',
            'end_time' => '17:00',
            'duration_hours' => 2,
        ]);

        $response->assertSessionHasErrors(['start_time']);
    }

    public function test_user_can_cancel_own_reservation(): void
    {
        $reservation = Reservation::create([
            'user_id' => $this->user->id,
            'facility_id' => $this->facility->id,
            'reservation_date' => date('Y-m-d', strtotime('+3 days')),
            'start_time' => '10:00',
            'end_time' => '12:00',
            'duration_hours' => 2,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)->patch(route('reservations.cancel', $reservation->id));
        $response->assertSessionHasNoErrors();
        $this->assertEquals('cancelled', $reservation->fresh()->status);
    }

    public function test_user_can_mark_notifications_as_read(): void
    {
        $notification = Notification::create([
            'user_id' => $this->user->id,
            'type' => 'approval',
            'message' => 'Your booking was approved!',
            'is_read' => false,
        ]);

        $response = $this->actingAs($this->user)->post(route('notifications.read-all'));
        $response->assertSessionHasNoErrors();
        $this->assertTrue($notification->fresh()->is_read);
    }

    public function test_booking_rejected_when_facility_schedule_is_blocked_by_admin(): void
    {
        $date = date('Y-m-d', strtotime('+4 days'));

        \App\Models\Schedule::create([
            'facility_id' => $this->facility->id,
            'date' => $date,
            'start_time' => '08:00',
            'end_time' => '12:00',
            'status' => 'blocked',
        ]);

        $response = $this->actingAs($this->user)->post(route('reservations.store'), [
            'facility_id' => $this->facility->id,
            'reservation_date' => $date,
            'start_time' => '09:00',
            'end_time' => '11:00',
            'duration_hours' => 2,
        ]);

        $response->assertSessionHasErrors(['start_time']);
    }

    public function test_admin_schedule_block_rejected_when_user_reservation_exists(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'approved']);
        $date = date('Y-m-d', strtotime('+5 days'));

        Reservation::create([
            'user_id' => $this->user->id,
            'facility_id' => $this->facility->id,
            'reservation_date' => $date,
            'start_time' => '14:00',
            'end_time' => '16:00',
            'duration_hours' => 2,
            'status' => 'approved',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.schedules.store'), [
            'facility_id' => $this->facility->id,
            'date' => $date,
            'start_time' => '13:00',
            'end_time' => '15:00',
            'status' => 'maintenance',
        ]);

        $response->assertSessionHasErrors(['start_time']);
    }
}
