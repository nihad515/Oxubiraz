<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
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
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $dashboardUrl = config('app.frontend_url', 'https://oxubiraz.az');

        return (new MailMessage)
            ->subject("🔥 {$this->days} günlük seriya!")
            ->view('emails.streak-milestone', [
                'userName' => $notifiable->first_name ?? $notifiable->username,
                'days' => $this->days,
                'xpBonus' => $this->xpBonus,
                'dashboardUrl' => $dashboardUrl,
            ]);
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
