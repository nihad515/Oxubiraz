<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class LevelUp extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly int $newLevel,
        private readonly int $xp,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'level_up',
            'new_level' => $this->newLevel,
            'xp' => $this->xp,
        ];
    }
}
