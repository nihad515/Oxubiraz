<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
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
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $dashboardUrl = config('app.frontend_url', 'https://oxubiraz.az');

        return (new MailMessage)
            ->subject("⚡ Səviyyə {$this->newLevel}-ə yüksəldiniz!")
            ->view('emails.level-up', [
                'userName' => $notifiable->first_name ?? $notifiable->username,
                'newLevel' => $this->newLevel,
                'xp' => $this->xp,
                'dashboardUrl' => $dashboardUrl,
            ]);
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
