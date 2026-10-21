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

    public function test_same_booking_group_reaches_capacity_and_conflicts(): void
    {
        $date = date('Y-m-d', strtotime('+2 days'));

        $indoorOne = Facility::factory()->create([
            'name' => 'Basketball Court A',
            'type' => 'Indoor',
            'booking_group' => 'indoor',
            'booking_capacity' => 1,
            'active' => true,
        ]);

        $indoorTwo = Facility::factory()->create([
            'name' => 'Basketball Court B',
            'type' => 'Indoor',
            'booking_group' => 'indoor',
            'booking_capacity' => 1,
            'active' => true,
        ]);

        Reservation::create([
            'user_id' => $this->user->id,
            'facility_id' => $indoorOne->id,
            'reservation_date' => $date,
            'start_time' => '18:00',
            'end_time' => '20:00',
            'duration_hours' => 2,
            'status' => 'approved',
        ]);

        $anotherUser = User::factory()->create(['role' => 'user', 'status' => 'approved']);

        $response = $this->actingAs($anotherUser)->post(route('reservations.store'), [
            'facility_id' => $indoorTwo->id,
            'reservation_date' => $date,
            'start_time' => '19:00',
            'end_time' => '21:00',
            'duration_hours' => 2,
        ]);

        $response->assertSessionHasErrors(['start_time']);
    }

    public function test_same_booking_group_allows_capacity_two_for_outdoor_facilities(): void
    {
        $date = date('Y-m-d', strtotime('+3 days'));

        $tennisOne = Facility::factory()->create([
            'name' => 'Tennis Court A',
            'type' => 'Outdoor',
            'booking_group' => 'outdoor',
            'booking_capacity' => 2,
            'active' => true,
        ]);

        $tennisTwo = Facility::factory()->create([
            'name' => 'Tennis Court B',
            'type' => 'Outdoor',
            'booking_group' => 'outdoor',
            'booking_capacity' => 2,
            'active' => true,
        ]);

        Reservation::create([
            'user_id' => $this->user->id,
            'facility_id' => $tennisOne->id,
            'reservation_date' => $date,
            'start_time' => '14:00',
            'end_time' => '16:00',
            'duration_hours' => 2,
            'status' => 'approved',
        ]);

        $anotherUser = User::factory()->create(['role' => 'user', 'status' => 'approved']);

        $response = $this->actingAs($anotherUser)->post(route('reservations.store'), [
            'facility_id' => $tennisTwo->id,
            'reservation_date' => $date,
            'start_time' => '15:00',
            'end_time' => '17:00',
            'duration_hours' => 2,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('reservations', [
            'facility_id' => $tennisTwo->id,
            'reservation_date' => $date,
            'status' => 'pending',
        ]);
    }

    public function test_user_can_book_intramurals_as_long_event_booking(): void
    {
        $this->facility->update([
            'requires_event_type' => true,
            'event_options' => ['Intramurals', 'Tournament', 'Exhibition Match', 'Others'],
            'allow_custom_event_name' => true,
            'max_hours' => 2,
        ]);

        $date = date('Y-m-d', strtotime('+2 days'));

        $response = $this->actingAs($this->user)->post(route('reservations.store'), [
            'facility_id' => $this->facility->id,
            'reservation_date' => $date,
            'start_time' => '08:00',
            'end_time' => '17:00',
            'duration_hours' => 9,
            'event_type' => 'Intramurals',
            'custom_event_name' => 'Campus Intramurals',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('reservations', [
            'user_id' => $this->user->id,
            'facility_id' => $this->facility->id,
            'reservation_date' => $date,
            'event_type' => 'Intramurals',
            'custom_event_name' => 'Campus Intramurals',
            'status' => 'pending',
        ]);
    }

    public function test_same_day_booking_cannot_start_in_the_past(): void
    {
        $today = date('Y-m-d');
        $pastHour = max(0, (int) date('H') - 1);

        $response = $this->actingAs($this->user)->post(route('reservations.store'), [
            'facility_id' => $this->facility->id,
            'reservation_date' => $today,
            'start_time' => sprintf('%02d:00', $pastHour),
            'end_time' => sprintf('%02d:00', $pastHour + 2),
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

    public function test_user_can_submit_reservation_with_organization_and_contact_info(): void
    {
        $date = date('Y-m-d', strtotime('+3 days'));

        $response = $this->actingAs($this->user)->post(route('reservations.store'), [
            'facility_id' => $this->facility->id,
            'reservation_date' => $date,
            'start_time' => '10:00',
            'end_time' => '12:00',
            'duration_hours' => 2,
            'organization_or_school' => 'Getafe National High School',
            'contact_person' => 'Coach Santos',
            'contact_number' => '09171234567',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('reservations', [
            'user_id' => $this->user->id,
            'facility_id' => $this->facility->id,
            'organization_or_school' => 'Getafe National High School',
            'contact_person' => 'Coach Santos',
            'contact_number' => '09171234567',
        ]);
    }

    public function test_reservation_rejected_if_outside_facility_operating_hours(): void
    {
        $this->facility->update([
            'opening_time' => '08:00',
            'closing_time' => '17:00',
        ]);

        $date = date('Y-m-d', strtotime('+3 days'));

        // Before opening time (07:00 < 08:00)
        $responseEarly = $this->actingAs($this->user)->post(route('reservations.store'), [
            'facility_id' => $this->facility->id,
            'reservation_date' => $date,
            'start_time' => '07:00',
            'end_time' => '09:00',
            'duration_hours' => 2,
        ]);
        $responseEarly->assertSessionHasErrors(['start_time']);

        // After closing time (18:00 > 17:00)
        $responseLate = $this->actingAs($this->user)->post(route('reservations.store'), [
            'facility_id' => $this->facility->id,
            'reservation_date' => $date,
            'start_time' => '16:00',
            'end_time' => '18:00',
            'duration_hours' => 2,
        ]);
        $responseLate->assertSessionHasErrors(['end_time']);
    }
}
