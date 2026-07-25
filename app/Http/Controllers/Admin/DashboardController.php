<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use App\Models\Reservation;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'totalUsers' => User::where('role', 'user')->count(),
            'pendingRegistrations' => User::where('status', 'pending')->count(),
            'totalFacilities' => Facility::count(),
            'activeFacilities' => Facility::where('active', true)->count(),
            'totalReservations' => Reservation::count(),
            'pendingReservations' => Reservation::where('status', 'pending')->count(),
            'approvedReservations' => Reservation::where('status', 'approved')->count(),
        ];

        $recentReservations = Reservation::with(['user', 'facility'])
            ->latest()
            ->take(5)
            ->get();

        $pendingUsers = User::where('status', 'pending')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentReservations' => $recentReservations,
            'pendingUsers' => $pendingUsers,
        ]);
    }
}
