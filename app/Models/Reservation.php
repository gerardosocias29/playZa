<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'facility_id',
        'event_type',
        'custom_event_name',
        'reservation_date',
        'end_date',
        'start_time',
        'end_time',
        'duration_hours',
        'status',
    ];

    /** Last day of the booking; single-day rows fall back to the start date. */
    public function getLastDateAttribute(): string
    {
        return $this->end_date ?: $this->reservation_date;
    }

    public function isMultiDay(): bool
    {
        return $this->end_date && $this->end_date !== $this->reservation_date;
    }

    /** Human-readable date span for notifications: a single date, or "start to end". */
    public function getDateLabelAttribute(): string
    {
        return $this->isMultiDay()
            ? "{$this->reservation_date} to {$this->end_date}"
            : (string) $this->reservation_date;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }
}
