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

    private function processImages(Request $request, array $existingImages = []): array
    {
        $images = $request->input('images', $existingImages) ?? [];
        if (!is_array($images)) {
            $images = [];
        }

        if ($request->hasFile('image_files')) {
            $files = $request->file('image_files');
            if (!is_array($files)) {
                $files = [$files];
            }
            foreach ($files as $file) {
                if ($file && $file->isValid()) {
                    $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $destinationPath = public_path('uploads/facilities');
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0755, true);
                    }
                    $file->move($destinationPath, $filename);
                    $images[] = '/uploads/facilities/' . $filename;
                }
            }
        }

        return array_values(array_filter($images));
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
            'image_files.*' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'opening_time' => 'nullable|string',
            'closing_time' => 'nullable|string',
            'booking_group' => 'nullable|string|max:50',
            'booking_capacity' => 'nullable|integer|min:1|max:20',
            'active' => 'boolean',
        ]);

        $validated['images'] = $this->processImages($request);
        $validated['opening_time'] = $validated['opening_time'] ?? '08:00';
        $validated['closing_time'] = $validated['closing_time'] ?? '22:00';
        unset($validated['image_files']);

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
            'image_files.*' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'opening_time' => 'nullable|string',
            'closing_time' => 'nullable|string',
            'booking_group' => 'nullable|string|max:50',
            'booking_capacity' => 'nullable|integer|min:1|max:20',
            'active' => 'boolean',
        ]);

        $validated['images'] = $this->processImages($request, $facility->images ?? []);
        $validated['opening_time'] = $validated['opening_time'] ?? $facility->opening_time ?? '08:00';
        $validated['closing_time'] = $validated['closing_time'] ?? $facility->closing_time ?? '22:00';
        unset($validated['image_files']);

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
