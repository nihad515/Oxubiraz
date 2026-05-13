<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;
use NotificationChannels\WebPush\WebPushChannel;

class StreakMilestone extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly int $days,
        private readonly int $xpBonus,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail', WebPushChannel::class];
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

    public function toWebPush(object $notifiable, mixed $notification): WebPushMessage
    {
        $frontendUrl = config('app.frontend_url', 'https://oxubiraz.az');

        return (new WebPushMessage)
            ->title("🔥 {$this->days} günlük seriya!")
            ->icon('/icons/icon-192x192.png')
            ->body("+{$this->xpBonus} bonus XP qazandınız!")
            ->data(['url' => "{$frontendUrl}/student/dashboard"])
            ->badge('/icons/icon-96x96.png')
            ->vibrate([100, 50, 100]);
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
