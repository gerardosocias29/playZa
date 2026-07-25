<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use App\Models\Reservation;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FacilityController extends Controller
{
    public function index(): Response
    {
        $facilities = Facility::where('active', true)->get();
        $reservations = Reservation::whereIn('status', ['pending', 'approved'])->get();
        $schedules = Schedule::all();

        return Inertia::render('User/Facilities', [
            'facilities' => $facilities,
            'reservations' => $reservations,
            'schedules' => $schedules,
        ]);
    }
}
