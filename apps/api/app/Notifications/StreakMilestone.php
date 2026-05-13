<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class StreakMilestone extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly int $days,
        private readonly int $xpBonus,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'streak_milestone',
            'days' => $this->days,
            'xp_bonus' => $this->xpBonus,
        ];
    }
}
