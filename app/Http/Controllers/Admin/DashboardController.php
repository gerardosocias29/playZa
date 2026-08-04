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

        // Reservation status distribution breakdown
        $statusBreakdown = [
            'approved' => Reservation::where('status', 'approved')->count(),
            'pending' => Reservation::where('status', 'pending')->count(),
            'completed' => Reservation::where('status', 'completed')->count(),
            'cancelled' => Reservation::where('status', 'cancelled')->count(),
            'no_show' => Reservation::where('status', 'no_show')->count(),
            'rejected' => Reservation::where('status', 'rejected')->count(),
        ];

        // Facility utilization distribution
        $facilityUtilization = Facility::withCount('reservations')
            ->get()
            ->map(function ($fac) {
                return [
                    'id' => $fac->id,
                    'name' => $fac->name,
                    'count' => $fac->reservations_count,
                ];
            });

        // Monthly reservation trends for current year
        $monthlyData = [];
        for ($m = 1; $m <= 12; $m++) {
            $monthName = date('M', mktime(0, 0, 0, $m, 1));
            $count = Reservation::whereYear('reservation_date', date('Y'))
                ->whereMonth('reservation_date', $m)
                ->count();
            $monthlyData[] = [
                'month' => $monthName,
                'count' => $count,
            ];
        }

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentReservations' => $recentReservations,
            'pendingUsers' => $pendingUsers,
            'statusBreakdown' => $statusBreakdown,
            'facilityUtilization' => $facilityUtilization,
            'reservationTrends' => $monthlyData,
        ]);
    }
}
