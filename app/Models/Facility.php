<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facility extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'category',
        'description',
        'images',
        'active',
        'requires_event_type',
        'event_options',
        'allow_custom_event_name',
        'max_hours',
        'allow_custom_events',
    ];

    protected $casts = [
        'images' => 'array',
        'active' => 'boolean',
        'requires_event_type' => 'boolean',
        'event_options' => 'array',
        'allow_custom_event_name' => 'boolean',
        'max_hours' => 'integer',
        'allow_custom_events' => 'boolean',
    ];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
}
