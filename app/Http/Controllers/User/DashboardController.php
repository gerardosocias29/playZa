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
        $todayStr = now()->format('Y-m-d');

        $facilities = Facility::where('active', true)->get();
        $userReservations = Reservation::with('facility')
            ->where('user_id', $userId)
            ->latest()
            ->get();

        $notifications = Notification::where('user_id', $userId)
            ->latest()
            ->take(6)
            ->get();

        $allReservations = Reservation::whereIn('status', ['pending', 'approved'])->get();
        $schedules = Schedule::all();

        // Calculate personal statistics
        $activeBookings = $userReservations->filter(function ($r) use ($todayStr) {
            $endDate = $r->end_date ?: $r->reservation_date;
            return $r->status === 'approved' && $endDate >= $todayStr;
        })->count();

        $pendingBookings = $userReservations->where('status', 'pending')->count();
        
        $completedBookings = $userReservations->filter(function ($r) use ($todayStr) {
            $endDate = $r->end_date ?: $r->reservation_date;
            return $r->status === 'completed' || ($r->status === 'approved' && $endDate < $todayStr);
        })->count();

        $upcomingReservations = $userReservations->filter(function ($r) use ($todayStr) {
            $endDate = $r->end_date ?: $r->reservation_date;
            return in_array($r->status, ['pending', 'approved']) && $endDate >= $todayStr;
        })->values();

        $stats = [
            'activeBookings' => $activeBookings,
            'pendingBookings' => $pendingBookings,
            'completedBookings' => $completedBookings,
            'totalBookings' => $userReservations->count(),
            'activeFacilities' => $facilities->count(),
        ];

        return Inertia::render('User/Dashboard', [
            'facilities' => $facilities,
            'userReservations' => $userReservations,
            'upcomingReservations' => $upcomingReservations,
            'notifications' => $notifications,
            'reservations' => $allReservations,
            'schedules' => $schedules,
            'stats' => $stats,
        ]);
    }
}
