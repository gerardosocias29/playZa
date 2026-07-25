<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use App\Models\Reservation;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(): Response
    {
        $totalUsers = User::where('role', 'user')->count();
        $approvedUsers = User::where('role', 'user')->where('status', 'approved')->count();
        $pendingUsers = User::where('role', 'user')->where('status', 'pending')->count();
        $totalFacilities = Facility::count();
        $activeFacilities = Facility::where('active', true)->count();
        $totalReservations = Reservation::count();
        $approvedReservations = Reservation::where('status', 'approved')->count();
        $pendingReservations = Reservation::where('status', 'pending')->count();
        $rejectedReservations = Reservation::where('status', 'rejected')->count();
        $cancelledReservations = Reservation::where('status', 'cancelled')->count();

        $recentReservations = Reservation::with(['user', 'facility'])
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Admin/Reports', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'approvedUsers' => $approvedUsers,
                'pendingUsers' => $pendingUsers,
                'totalFacilities' => $totalFacilities,
                'activeFacilities' => $activeFacilities,
                'totalReservations' => $totalReservations,
                'approvedReservations' => $approvedReservations,
                'pendingReservations' => $pendingReservations,
                'rejectedReservations' => $rejectedReservations,
                'cancelledReservations' => $cancelledReservations,
            ],
            'recentReservations' => $recentReservations,
        ]);
    }
}
