<?php

namespace App\Notifications;

use App\Models\Achievement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AchievementEarned extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly Achievement $achievement,
        private readonly string $locale = 'az',
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $name = $this->achievement->{"name_{$this->locale}"} ?? $this->achievement->name_az;
        $description = $this->achievement->{"description_{$this->locale}"} ?? $this->achievement->description_az;

        return [
            'type' => 'achievement_earned',
            'achievement_id' => $this->achievement->id,
            'name' => $name,
            'description' => $description,
            'icon' => $this->achievement->icon,
            'xp_reward' => $this->achievement->xp_reward,
        ];
    }
}
