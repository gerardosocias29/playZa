<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $unreadCount = 0;
        $adminPendingReservations = [];
        $adminPendingCount = 0;

        if ($user) {
            $unreadCount = \App\Models\Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count();

            if ($user->role === 'admin') {
                $pendingQuery = \App\Models\Reservation::where('status', 'pending')
                    ->with(['user', 'facility'])
                    ->latest();
                $adminPendingCount = $pendingQuery->count();
                $adminPendingReservations = $pendingQuery->take(5)->get()->map(function ($res) {
                    return [
                        'id' => $res->id,
                        'userName' => $res->user ? $res->user->name : ($res->contact_person ?: 'Guest User'),
                        'facilityName' => $res->facility ? $res->facility->name : 'Facility',
                        'date' => $res->reservation_date,
                        'timeSlot' => "{$res->start_time} - {$res->end_time}",
                        'status' => $res->status,
                        'created_at' => $res->created_at?->toDateTimeString(),
                    ];
                })->toArray();
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'unreadNotificationsCount' => $unreadCount,
                'adminPendingCount' => $adminPendingCount,
                'adminPendingReservations' => $adminPendingReservations,
            ],
            'flash' => [
                'message' => session('message'),
                'success' => session('success'),
                'error' => session('error'),
                'status' => session('status'),
                'warning' => session('warning'),
            ],
        ];
    }
}
