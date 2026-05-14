<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class AdminBroadcast extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $title,
        public readonly string $message,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', WebPushChannel::class];
    }

    public function toWebPush(object $notifiable, mixed $notification): WebPushMessage
    {
        $frontendUrl = config('app.frontend_url', 'https://oxubiraz.az');

        return (new WebPushMessage)
            ->title($this->title)
            ->icon('/icons/icon-192x192.png')
            ->body($this->message)
            ->data(['url' => "{$frontendUrl}/student/notifications"])
            ->badge('/icons/icon-96x96.png');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'    => 'admin_broadcast',
            'title'   => $this->title,
            'message' => $this->message,
        ];
    }
}
