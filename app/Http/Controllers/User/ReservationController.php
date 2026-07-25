<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use App\Models\Notification;
use App\Models\Reservation;
use App\Models\Schedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $reservations = Reservation::with('facility')
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        $facilities = Facility::where('active', true)->get();
        $blockedSchedules = Schedule::where('status', '!=', 'available')->get();

        return Inertia::render('User/Reservations', [
            'reservations' => $reservations,
            'facilities' => $facilities,
            'blockedSchedules' => $blockedSchedules,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'facility_id' => 'required|exists:facilities,id',
            'reservation_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'duration_hours' => 'required|integer|min:1',
            'event_type' => 'nullable|string',
            'custom_event_name' => 'nullable|string',
        ]);

        $facility = Facility::findOrFail($validated['facility_id']);

        if ($facility->requires_event_type && empty($validated['event_type']) && empty($validated['custom_event_name'])) {
            return back()->withErrors(['event_type' => 'Event type or custom event name is required for this facility.']);
        }

        // Helper to convert "HH:MM" string to minutes from midnight
        $timeToMinutes = function ($timeStr) {
            $parts = explode(':', $timeStr);
            $h = (int) ($parts[0] ?? 0);
            $m = (int) ($parts[1] ?? 0);
            if ($h === 0 && count($parts) > 1 && $parts[0] === '00') {
                $h = 24; // midnight end time
            }
            return $h * 60 + $m;
        };

        $newStartMin = $timeToMinutes($validated['start_time']);
        $newEndMin = $timeToMinutes($validated['end_time']);
        if ($newEndMin <= $newStartMin) {
            $newEndMin += 24 * 60; // next day midnight wrap
        }

        // Double Booking Check against existing active reservations
        $existingReservations = Reservation::where('facility_id', $validated['facility_id'])
            ->where('reservation_date', $validated['reservation_date'])
            ->whereIn('status', ['pending', 'approved'])
            ->get();

        foreach ($existingReservations as $existing) {
            $exStartMin = $timeToMinutes($existing->start_time);
            $exEndMin = $timeToMinutes($existing->end_time);
            if ($exEndMin <= $exStartMin) {
                $exEndMin += 24 * 60;
            }

            // Check for overlap: (StartA < EndB) and (EndA > StartB)
            if ($newStartMin < $exEndMin && $newEndMin > $exStartMin) {
                return back()->withErrors([
                    'start_time' => "Double booking conflict! The facility is already reserved from {$existing->start_time} to {$existing->end_time} on {$existing->reservation_date}.",
                ]);
            }
        }

        $reservation = Reservation::create([
            'user_id' => Auth::id(),
            'facility_id' => $validated['facility_id'],
            'reservation_date' => $validated['reservation_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'duration_hours' => $validated['duration_hours'],
            'event_type' => $validated['event_type'] ?? null,
            'custom_event_name' => $validated['custom_event_name'] ?? null,
            'status' => 'pending',
        ]);

        Notification::create([
            'user_id' => Auth::id(),
            'reservation_id' => $reservation->id,
            'type' => 'info',
            'message' => "Your reservation request for {$facility->name} on {$validated['reservation_date']} ({$validated['start_time']} - {$validated['end_time']}) has been submitted and is pending admin approval.",
        ]);

        return back()->with('message', 'Reservation request submitted successfully! Pending admin approval.');
    }

    public function cancel(Reservation $reservation): RedirectResponse
    {
        if ($reservation->user_id !== Auth::id()) {
            abort(403);
        }

        $reservation->update(['status' => 'cancelled']);

        Notification::create([
            'user_id' => Auth::id(),
            'reservation_id' => $reservation->id,
            'type' => 'cancellation',
            'message' => "You cancelled your reservation for {$reservation->facility->name} on {$reservation->reservation_date}.",
        ]);

        return back()->with('message', 'Reservation cancelled successfully.');
    }
}
