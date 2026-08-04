<?php

namespace App\Notifications;

use App\Models\Notification as NotificationModel;
use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReservationStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Reservation $reservation;
    public string $statusType; // approval, rejection, cancellation, no_show, info
    public string $customMessage;

    public function __construct(Reservation $reservation, string $statusType, string $customMessage)
    {
        $this->reservation = $reservation;
        $this->statusType = $statusType;
        $this->customMessage = $customMessage;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $facilityName = $this->reservation->facility?->name ?? 'Sports Facility';
        $date = $this->reservation->reservation_date;
        $time = "{$this->reservation->start_time} - {$this->reservation->end_time}";
        $statusUpper = strtoupper($this->statusType);

        // Also ensure in-app notification row is created upon dispatch
        NotificationModel::create([
            'user_id' => $notifiable->id,
            'reservation_id' => $this->reservation->id,
            'type' => $this->statusType,
            'message' => $this->customMessage,
            'is_read' => false,
        ]);

        return (new MailMessage)
            ->subject("PlayZa Reservation Update: {$facilityName} ({$statusUpper})")
            ->greeting("Hello {$notifiable->name},")
            ->line("Your reservation status for {$facilityName} has been updated to {$statusUpper}.")
            ->line("Date: {$date}")
            ->line("Time Slot: {$time}")
            ->line("Details: {$this->customMessage}")
            ->action('View My Reservations', url('/my-reservations'))
            ->line('Thank you for using PlayZa Getafe Sports Facilities!');
    }
}
