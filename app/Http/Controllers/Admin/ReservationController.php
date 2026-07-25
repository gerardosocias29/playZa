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

        return Inertia::render('Admin/Reservations', [
            'reservations' => $reservations,
        ]);
    }

    public function approve(Reservation $reservation): RedirectResponse
    {
        $reservation->update(['status' => 'approved']);

        Notification::create([
            'user_id' => $reservation->user_id,
            'reservation_id' => $reservation->id,
            'type' => 'approval',
            'message' => "Your reservation for {$reservation->facility->name} on {$reservation->reservation_date} ({$reservation->start_time} - {$reservation->end_time}) has been APPROVED.",
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
            'message' => "Your reservation for {$reservation->facility->name} on {$reservation->reservation_date} ({$reservation->start_time} - {$reservation->end_time}) has been REJECTED.",
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
            'message' => "Your reservation for {$reservation->facility->name} on {$reservation->reservation_date} ({$reservation->start_time} - {$reservation->end_time}) has been CANCELLED by Admin.",
        ]);

        return back()->with('message', 'Reservation cancelled.');
    }
}
