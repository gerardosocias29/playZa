<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Reservation;
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

        Notification::create([
            'user_id' => $reservation->user_id,
            'reservation_id' => $reservation->id,
            'type' => 'approval',
            'message' => "Your reservation for {$reservation->facility->name} on {$reservation->date_label} ({$reservation->start_time} - {$reservation->end_time}) has been APPROVED.",
        ]);

        return back()->with('message', 'Reservation approved.');
    }

    public function reject(Reservation $reservation): RedirectResponse
    {
        $reservation->update(['status' => 'rejected']);

        Notification::create([
            'user_id' => $reservation->user_id,
            'reservation_id' => $reservation->id,
            'type' => 'rejection',
            'message' => "Your reservation for {$reservation->facility->name} on {$reservation->date_label} ({$reservation->start_time} - {$reservation->end_time}) has been REJECTED.",
        ]);

        return back()->with('message', 'Reservation rejected.');
    }

    public function cancel(Reservation $reservation): RedirectResponse
    {
        $reservation->update(['status' => 'cancelled']);

        Notification::create([
            'user_id' => $reservation->user_id,
            'reservation_id' => $reservation->id,
            'type' => 'cancellation',
            'message' => "Your reservation for {$reservation->facility->name} on {$reservation->date_label} ({$reservation->start_time} - {$reservation->end_time}) has been CANCELLED by Admin.",
        ]);

        return back()->with('message', 'Reservation cancelled.');
    }
}
