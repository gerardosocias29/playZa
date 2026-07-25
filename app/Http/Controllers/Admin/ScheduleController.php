<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use App\Models\Schedule;
use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function index(): Response
    {
        $facilities = Facility::where('active', true)->get();
        $schedules = Schedule::with('facility')->latest()->get();
        $reservations = Reservation::with(['user', 'facility'])->get();

        return Inertia::render('Admin/Schedules', [
            'facilities' => $facilities,
            'schedules' => $schedules,
            'reservations' => $reservations,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'facility_id' => 'required|exists:facilities,id',
            'date' => 'required|date',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'status' => 'required|string|in:available,blocked,maintenance',
        ]);

        Schedule::create($validated);

        return back()->with('message', 'Schedule slot saved successfully.');
    }

    public function destroy(Schedule $schedule): RedirectResponse
    {
        $schedule->delete();
        return back()->with('message', 'Schedule slot removed.');
    }
}
