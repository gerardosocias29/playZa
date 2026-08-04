<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use App\Models\Reservation;
use App\Models\Schedule;
use Illuminate\Http\JsonResponse;
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

    public function checkAvailability(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'facility_id' => 'required|exists:facilities,id',
            'date' => 'required|date',
        ]);

        $facilityId = $validated['facility_id'];
        $date = $validated['date'];

        $reservations = Reservation::where('facility_id', $facilityId)
            ->whereIn('status', ['pending', 'approved'])
            ->where(function ($q) use ($date) {
                $q->whereDate('reservation_date', '<=', $date)
                  ->whereDate(\Illuminate\Support\Facades\DB::raw('COALESCE(end_date, reservation_date)'), '>=', $date);
            })
            ->get(['id', 'start_time', 'end_time', 'status', 'event_type', 'custom_event_name']);

        $blockedSchedules = Schedule::where('facility_id', $facilityId)
            ->where('date', $date)
            ->where('status', '!=', 'available')
            ->get(['id', 'start_time', 'end_time', 'status']);

        return response()->json([
            'facility_id' => $facilityId,
            'date' => $date,
            'reservations' => $reservations,
            'blockedSchedules' => $blockedSchedules,
        ]);
    }
}
