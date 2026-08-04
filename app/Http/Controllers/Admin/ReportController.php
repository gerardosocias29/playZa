<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use App\Models\Reservation;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index(): Response
    {
        $totalUsers = User::where('role', 'user')->count();
        $approvedUsers = User::where('role', 'user')->where('status', 'approved')->count();
        $pendingUsers = User::where('role', 'user')->where('status', 'pending')->count();
        $rejectedUsers = User::where('role', 'user')->where('status', 'rejected')->count();

        $totalFacilities = Facility::count();
        $activeFacilities = Facility::where('active', true)->count();
        
        $totalReservations = Reservation::count();
        $approvedReservations = Reservation::where('status', 'approved')->count();
        $completedReservations = Reservation::where('status', 'completed')->count();
        $pendingReservations = Reservation::where('status', 'pending')->count();
        $rejectedReservations = Reservation::where('status', 'rejected')->count();
        $cancelledReservations = Reservation::where('status', 'cancelled')->count();
        $noShowReservations = Reservation::where('status', 'no_show')->count();

        $reservationsList = Reservation::with(['user', 'facility'])
            ->latest()
            ->get();

        $usersList = User::where('role', 'user')->latest()->get();
        $facilitiesList = Facility::withCount('reservations')->get();
        $schedulesList = Schedule::with('facility')->latest()->get();

        return Inertia::render('Admin/Reports', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'approvedUsers' => $approvedUsers,
                'pendingUsers' => $pendingUsers,
                'rejectedUsers' => $rejectedUsers,
                'totalFacilities' => $totalFacilities,
                'activeFacilities' => $activeFacilities,
                'totalReservations' => $totalReservations,
                'approvedReservations' => $approvedReservations,
                'completedReservations' => $completedReservations,
                'pendingReservations' => $pendingReservations,
                'rejectedReservations' => $rejectedReservations,
                'cancelledReservations' => $cancelledReservations,
                'noShowReservations' => $noShowReservations,
            ],
            'reservationsList' => $reservationsList,
            'usersList' => $usersList,
            'facilitiesList' => $facilitiesList,
            'schedulesList' => $schedulesList,
        ]);
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $type = $request->query('type', 'reservations');
        $fileName = "playza_{$type}_report_" . date('Y-m-d_H-i') . ".csv";

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$fileName\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($type) {
            $handle = fopen('php://output', 'w');

            if ($type === 'users') {
                fputcsv($handle, ['ID', 'Name', 'Email', 'Role', 'Status', 'Created At']);
                User::chunk(200, function ($users) use ($handle) {
                    foreach ($users as $user) {
                        fputcsv($handle, [
                            $user->id,
                            $user->name,
                            $user->email,
                            $user->role,
                            $user->status,
                            $user->created_at ? $user->created_at->toDateTimeString() : '',
                        ]);
                    }
                });
            } elseif ($type === 'facilities') {
                fputcsv($handle, ['ID', 'Name', 'Type', 'Category', 'Active', 'Total Bookings']);
                Facility::withCount('reservations')->chunk(200, function ($facilities) use ($handle) {
                    foreach ($facilities as $facility) {
                        fputcsv($handle, [
                            $facility->id,
                            $facility->name,
                            $facility->type,
                            $facility->category,
                            $facility->active ? 'Yes' : 'No',
                            $facility->reservations_count,
                        ]);
                    }
                });
            } elseif ($type === 'schedules') {
                fputcsv($handle, ['ID', 'Facility', 'Date', 'Start Time', 'End Time', 'Status']);
                Schedule::with('facility')->chunk(200, function ($schedules) use ($handle) {
                    foreach ($schedules as $schedule) {
                        fputcsv($handle, [
                            $schedule->id,
                            $schedule->facility ? $schedule->facility->name : 'N/A',
                            $schedule->date,
                            $schedule->start_time,
                            $schedule->end_time,
                            $schedule->status,
                        ]);
                    }
                });
            } else {
                fputcsv($handle, ['ID', 'User', 'User Email', 'Facility', 'Date Range', 'Time Slot', 'Duration (Hrs)', 'Event Type', 'Status']);
                Reservation::with(['user', 'facility'])->chunk(200, function ($reservations) use ($handle) {
                    foreach ($reservations as $res) {
                        $dateSpan = $res->end_date && $res->end_date !== $res->reservation_date
                            ? "{$res->reservation_date} to {$res->end_date}"
                            : $res->reservation_date;

                        fputcsv($handle, [
                            $res->id,
                            $res->user ? $res->user->name : 'N/A',
                            $res->user ? $res->user->email : 'N/A',
                            $res->facility ? $res->facility->name : 'N/A',
                            $dateSpan,
                            "{$res->start_time} - {$res->end_time}",
                            $res->duration_hours,
                            $res->event_type ?: ($res->custom_event_name ?: 'N/A'),
                            $res->status,
                        ]);
                    }
                });
            }

            fclose($handle);
        }, 200, $headers);
    }

    public function exportPdf(Request $request)
    {
        $type = ucfirst($request->query('type', 'reservations'));
        $dateStr = date('F j, Y g:i A');

        $reservations = Reservation::with(['user', 'facility'])->latest()->get();
        $users = User::where('role', 'user')->latest()->get();
        $facilities = Facility::withCount('reservations')->get();
        $schedules = Schedule::with('facility')->latest()->get();

        $html = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <title>PlayZa System Report - {$type}</title>
            <style>
                body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #0b1c30; margin: 30px; }
                .header { text-align: center; border-b: 2px solid #0b1c30; padding-bottom: 15px; margin-bottom: 20px; }
                .title { font-size: 24px; font-weight: bold; color: #0b1c30; margin: 0; }
                .subtitle { font-size: 12px; color: #0077CC; font-weight: bold; margin-top: 5px; }
                .meta { font-size: 10px; color: #64748b; margin-top: 5px; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th { background: #0b1c30; color: #ffffff; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; }
                td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
                tr:nth-child(even) { background: #f8fafc; }
                .badge { padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; display: inline-block; }
                .badge-approved { background: #dcfce7; color: #166534; }
                .badge-pending { background: #fef3c7; color: #92400e; }
                .badge-cancelled { background: #ffe4e6; color: #9f1239; }
                .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center; font-size: 10px; color: #94a3b8; }
            </style>
        </head>
        <body onload='window.print()'>
            <div class='header'>
                <div class='title'>PlayZa Sports System Report</div>
                <div class='subtitle'>Official Report: {$type} Activity Metrics</div>
                <div class='meta'>Generated on {$dateStr} • Getafe Municipal Sports Network</div>
            </div>

            <table>
                <thead>";

        if (strtolower($type) === 'users') {
            $html .= "<tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined Date</th></tr></thead><tbody>";
            foreach ($users as $u) {
                $html .= "<tr><td>{$u->id}</td><td><b>{$u->name}</b></td><td>{$u->email}</td><td>{$u->role}</td><td><span class='badge badge-approved'>{$u->status}</span></td><td>{$u->created_at->format('Y-m-d')}</td></tr>";
            }
        } elseif (strtolower($type) === 'facilities') {
            $html .= "<tr><th>ID</th><th>Facility Name</th><th>Type</th><th>Category</th><th>Status</th><th>Total Bookings</th></tr></thead><tbody>";
            foreach ($facilities as $f) {
                $activeStr = $f->active ? 'Active' : 'Disabled';
                $html .= "<tr><td>{$f->id}</td><td><b>{$f->name}</b></td><td>{$f->type}</td><td>{$f->category}</td><td><span class='badge badge-approved'>{$activeStr}</span></td><td>{$f->reservations_count}</td></tr>";
            }
        } elseif (strtolower($type) === 'schedules') {
            $html .= "<tr><th>ID</th><th>Facility</th><th>Date</th><th>Start Time</th><th>End Time</th><th>Status</th></tr></thead><tbody>";
            foreach ($schedules as $s) {
                $facName = $s->facility ? $s->facility->name : 'N/A';
                $html .= "<tr><td>{$s->id}</td><td><b>{$facName}</b></td><td>{$s->date}</td><td>{$s->start_time}</td><td>{$s->end_time}</td><td>{$s->status}</td></tr>";
            }
        } else {
            $html .= "<tr><th>ID</th><th>Facility</th><th>User</th><th>Date & Time</th><th>Event Type</th><th>Status</th></tr></thead><tbody>";
            foreach ($reservations as $r) {
                $facName = $r->facility ? $r->facility->name : 'N/A';
                $userName = $r->user ? $r->user->name : 'N/A';
                $eventType = $r->event_type ?: ($r->custom_event_name ?: 'Casual Play');
                $html .= "<tr><td>{$r->id}</td><td><b>{$facName}</b></td><td>{$userName}</td><td>{$r->reservation_date} ({$r->start_time}-{$r->end_time})</td><td>{$eventType}</td><td><span class='badge badge-approved'>{$r->status}</span></td></tr>";
            }
        }

        $html .= "
                </tbody>
            </table>
            <div class='footer'>PlayZa Getafe Sports Facility Management System • Official PDF Export</div>
        </body>
        </html>";

        return response($html)->header('Content-Type', 'text/html');
    }
}
