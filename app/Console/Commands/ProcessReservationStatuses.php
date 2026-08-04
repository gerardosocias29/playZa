<?php

namespace App\Console\Commands;

use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ProcessReservationStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservations:process-statuses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Auto-update past approved reservations to completed (Done) and handle expired pending bookings.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $now = Carbon::now();
        $todayStr = $now->toDateString();
        $currentTimeStr = $now->format('H:i');

        // 1. Approved reservations whose end date/time has passed -> mark as 'completed' (Done)
        $pastApproved = Reservation::where('status', 'approved')
            ->where(function ($query) use ($todayStr, $currentTimeStr) {
                $query->whereDate(\Illuminate\Support\Facades\DB::raw('COALESCE(end_date, reservation_date)'), '<', $todayStr)
                    ->orWhere(function ($q) use ($todayStr, $currentTimeStr) {
                        $q->whereDate(\Illuminate\Support\Facades\DB::raw('COALESCE(end_date, reservation_date)'), '=', $todayStr)
                          ->where('end_time', '<=', $currentTimeStr);
                    });
            })
            ->get();

        $completedCount = 0;
        foreach ($pastApproved as $reservation) {
            $reservation->update(['status' => 'completed']);
            $completedCount++;
        }

        // 2. Pending reservations whose reservation date is past -> mark as expired/cancelled
        $pastPending = Reservation::where('status', 'pending')
            ->whereDate('reservation_date', '<', $todayStr)
            ->get();

        $expiredCount = 0;
        foreach ($pastPending as $reservation) {
            $reservation->update(['status' => 'cancelled']);
            $expiredCount++;
        }

        $this->info("Processed statuses: {$completedCount} marked as completed/Done, {$expiredCount} pending marked as expired/cancelled.");

        return Command::SUCCESS;
    }
}
