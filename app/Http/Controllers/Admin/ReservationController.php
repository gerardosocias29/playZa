<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Notifications\ReservationStatusNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    public function index(): Response
    {
        $reservations = Reservation::with(['user', 'facility'])
            ->latest()
            ->get();
        $facilities = \App\Models\Facility::where('active', true)->get();

        return Inertia::render('Admin/Reservations', [
            'reservations' => $reservations,
            'facilities' => $facilities,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'facility_id' => 'required|exists:facilities,id',
            'reservation_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:reservation_date',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'duration_hours' => 'required|integer|min:1',
            'event_type' => 'nullable|string',
            'custom_event_name' => 'nullable|string',
        ]);

        $reservation = Reservation::create([
            'user_id' => auth()->id(),
            'facility_id' => $validated['facility_id'],
            'reservation_date' => $validated['reservation_date'],
            'end_date' => $validated['end_date'] ?: $validated['reservation_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'duration_hours' => $validated['duration_hours'],
            'event_type' => $validated['event_type'] ?? 'Tournament',
            'custom_event_name' => $validated['custom_event_name'] ?? null,
            'status' => 'approved',
        ]);

        return back()->with('message', 'Tournament / Event reservation created successfully.');
    }

    public function approve(Reservation $reservation): RedirectResponse
    {
        $reservation->update(['status' => 'approved']);

        $message = "Your reservation for {$reservation->facility->name} on {$reservation->reservation_date} ({$reservation->start_time} - {$reservation->end_time}) has been APPROVED.";

        if ($reservation->user) {
            $reservation->user->notify(new ReservationStatusNotification($reservation, 'approval', $message));
        }

        return back()->with('message', 'Reservation approved.');
    }

    public function reject(Reservation $reservation): RedirectResponse
    {
        $reservation->update(['status' => 'rejected']);

        $message = "Your reservation for {$reservation->facility->name} on {$reservation->reservation_date} ({$reservation->start_time} - {$reservation->end_time}) has been REJECTED.";

        if ($reservation->user) {
            $reservation->user->notify(new ReservationStatusNotification($reservation, 'rejection', $message));
        }

        return back()->with('message', 'Reservation rejected.');
    }

    public function cancel(Reservation $reservation): RedirectResponse
    {
        $reservation->update(['status' => 'cancelled']);

        $message = "Your reservation for {$reservation->facility->name} on {$reservation->reservation_date} ({$reservation->start_time} - {$reservation->end_time}) has been CANCELLED by Admin.";

        if ($reservation->user) {
            $reservation->user->notify(new ReservationStatusNotification($reservation, 'cancellation', $message));
        }

        return back()->with('message', 'Reservation cancelled.');
    }

    public function markNoShow(Reservation $reservation): RedirectResponse
    {
        $reservation->update(['status' => 'no_show']);

        $message = "Your reservation for {$reservation->facility->name} on {$reservation->reservation_date} ({$reservation->start_time} - {$reservation->end_time}) was flagged as NO SHOW by Admin.";

        if ($reservation->user) {
            $reservation->user->notify(new ReservationStatusNotification($reservation, 'no_show', $message));
        }

        return back()->with('message', 'Reservation flagged as No Show.');
    }
}
