<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use App\Models\Notification;
use App\Models\Reservation;
use App\Models\Schedule;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $userId = Auth::id();
        $facilities = Facility::where('active', true)->get();
        $userReservations = Reservation::with('facility')
            ->where('user_id', $userId)
            ->latest()
            ->get();

        $notifications = Notification::where('user_id', $userId)
            ->latest()
            ->take(5)
            ->get();

        $allReservations = Reservation::whereIn('status', ['pending', 'approved'])->get();
        $schedules = Schedule::all();

        return Inertia::render('User/Dashboard', [
            'facilities' => $facilities,
            'userReservations' => $userReservations,
            'notifications' => $notifications,
            'reservations' => $allReservations,
            'schedules' => $schedules,
        ]);
    }
}
