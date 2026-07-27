<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use App\Models\Notification;
use App\Models\Reservation;
use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

    /** Minutes from midnight. A bare "00:00" end means midnight, i.e. 1440. */
    private function toMinutes(string $time): int
    {
        $parts = explode(':', $time);
        $minutes = ((int) ($parts[0] ?? 0)) * 60 + ((int) ($parts[1] ?? 0));

        return $minutes;
    }

    /**
     * Flatten a booking into absolute minute intervals on a shared timeline, so
     * ranges, overnight wraps and single days can all be compared the same way.
     * A multi-day booking occupies the same window on each day it covers.
     *
     * @return array<int, array{0: int, 1: int}>
     */
    private function occupiedIntervals(string $startDate, ?string $endDate, string $startTime, string $endTime): array
    {
        $startMin = $this->toMinutes($startTime);
        $endMin = $this->toMinutes($endTime);
        if ($endMin === 0) {
            $endMin = 1440;                 // "00:00" as an end is midnight
        }
        if ($endMin <= $startMin) {
            $endMin += 1440;                // overnight, spills into the next day
        }

        $origin = Carbon::parse('2000-01-01')->startOfDay();
        $first = Carbon::parse($startDate)->startOfDay();
        $last = Carbon::parse($endDate ?: $startDate)->startOfDay();
        if ($last->lt($first)) {
            $last = $first->copy();
        }

        $intervals = [];
        for ($day = $first->copy(); $day->lte($last); $day->addDay()) {
            $base = $origin->diffInDays($day, false) * 1440;
            $intervals[] = [$base + $startMin, $base + $endMin];
        }

        return $intervals;
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'facility_id' => 'required|exists:facilities,id',
            'reservation_date' => 'required|date|after_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:reservation_date',
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

        $startDate = $validated['reservation_date'];
        $endDate = $validated['end_date'] ?: $startDate;

        $newIntervals = $this->occupiedIntervals($startDate, $endDate, $validated['start_time'], $validated['end_time']);

        // Pull anything on this facility whose date window could touch ours. The
        // one-day margin on each side covers bookings that wrap past midnight.
        $existingReservations = Reservation::where('facility_id', $validated['facility_id'])
            ->whereIn('status', ['pending', 'approved'])
            ->whereDate('reservation_date', '<=', Carbon::parse($endDate)->addDay()->toDateString())
            ->whereDate(DB::raw('COALESCE(end_date, reservation_date)'), '>=', Carbon::parse($startDate)->subDay()->toDateString())
            ->get();

        foreach ($existingReservations as $existing) {
            $existingIntervals = $this->occupiedIntervals(
                $existing->reservation_date,
                $existing->end_date,
                $existing->start_time,
                $existing->end_time
            );

            foreach ($newIntervals as $new) {
                foreach ($existingIntervals as $taken) {
                    // Overlap when (StartA < EndB) and (EndA > StartB)
                    if ($new[0] < $taken[1] && $new[1] > $taken[0]) {
                        $when = $existing->end_date && $existing->end_date !== $existing->reservation_date
                            ? "{$existing->reservation_date} to {$existing->end_date}"
                            : $existing->reservation_date;

                        return back()->withErrors([
                            'start_time' => "Double booking conflict! The facility is already reserved from {$existing->start_time} to {$existing->end_time} on {$when}.",
                        ]);
                    }
                }
            }
        }

        $reservation = Reservation::create([
            'user_id' => Auth::id(),
            'facility_id' => $validated['facility_id'],
            'reservation_date' => $startDate,
            'end_date' => $endDate,
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'duration_hours' => $validated['duration_hours'],
            'event_type' => $validated['event_type'] ?? null,
            'custom_event_name' => $validated['custom_event_name'] ?? null,
            'status' => 'pending',
        ]);

        $when = $endDate !== $startDate ? "{$startDate} to {$endDate}" : $startDate;

        Notification::create([
            'user_id' => Auth::id(),
            'reservation_id' => $reservation->id,
            'type' => 'info',
            'message' => "Your reservation request for {$facility->name} on {$when} ({$validated['start_time']} - {$validated['end_time']}) has been submitted and is pending admin approval.",
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
            'message' => "You cancelled your reservation for {$reservation->facility->name} on {$reservation->date_label}.",
        ]);

        return back()->with('message', 'Reservation cancelled successfully.');
    }
}
