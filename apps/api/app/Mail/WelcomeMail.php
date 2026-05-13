<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $name;
    public string $username;
    public string $email;
    public string $dashboardUrl;

    public function __construct(User $user)
    {
        $this->name = $user->first_name ?? $user->username;
        $this->username = $user->username;
        $this->email = $user->email;
        $this->dashboardUrl = config('app.frontend_url', 'https://oxubiraz.az');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Oxubiraz-a xoş gəldiniz! 🎉',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome',
            with: [
                'name' => $this->name,
                'username' => $this->username,
                'email' => $this->email,
                'dashboardUrl' => $this->dashboardUrl,
            ],
        );
    }
}
