<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FacilityController extends Controller
{
    public function index(): Response
    {
        $facilities = Facility::latest()->get();
        return Inertia::render('Admin/Facilities', [
            'facilities' => $facilities,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'category' => 'required|string',
            'description' => 'nullable|string',
            'requires_event_type' => 'boolean',
            'event_options' => 'nullable|array',
            'allow_custom_event_name' => 'boolean',
            'max_hours' => 'nullable|integer|min:1|max:24',
            'allow_custom_events' => 'boolean',
            'images' => 'nullable|array',
            'booking_group' => 'nullable|string|max:50',
            'booking_capacity' => 'nullable|integer|min:1|max:20',
            'active' => 'boolean',
        ]);

        Facility::create($validated);

        return back()->with('message', 'Facility created successfully.');
    }

    public function update(Request $request, Facility $facility): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'category' => 'required|string',
            'description' => 'nullable|string',
            'requires_event_type' => 'boolean',
            'event_options' => 'nullable|array',
            'allow_custom_event_name' => 'boolean',
            'max_hours' => 'nullable|integer|min:1|max:24',
            'allow_custom_events' => 'boolean',
            'images' => 'nullable|array',
            'booking_group' => 'nullable|string|max:50',
            'booking_capacity' => 'nullable|integer|min:1|max:20',
            'active' => 'boolean',
        ]);

        $facility->update($validated);

        return back()->with('message', 'Facility updated successfully.');
    }

    public function toggleAvailability(Facility $facility): RedirectResponse
    {
        $facility->update(['active' => !$facility->active]);
        return back()->with('message', 'Facility status updated.');
    }

    public function destroy(Facility $facility): RedirectResponse
    {
        $facility->delete();
        return back()->with('message', 'Facility deleted successfully.');
    }
}
