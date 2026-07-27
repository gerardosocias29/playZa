<?php

namespace App\Http\Controllers;

use App\Models\Facility;
use App\Models\Reservation;
use App\Models\Schedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    /**
     * Public landing page. Ships the data the Check Availability modal needs so
     * open/booked hours are real for guests and signed-in users alike.
     */
    public function index(): Response|RedirectResponse
    {
        if (Auth::check() && Auth::user()->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Welcome', [
            'facilities' => Facility::where('active', true)->get(),
            'reservations' => Reservation::whereIn('status', ['pending', 'approved'])
                ->whereDate(DB::raw('COALESCE(end_date, reservation_date)'), '>=', now()->subDay()->toDateString())
                ->get(['id', 'facility_id', 'reservation_date', 'end_date', 'start_time', 'end_time', 'status']),
            'schedules' => Schedule::where('status', '!=', 'available')
                ->whereDate('date', '>=', now()->toDateString())
                ->get(['id', 'facility_id', 'date', 'start_time', 'end_time', 'status']),
        ]);
    }
}
