<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LeaderboardUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $scope, // 'global' | 'school_{id}' | 'class_{id}'
        public readonly array $topEntries,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("leaderboard.{$this->scope}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'leaderboard.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'scope' => $this->scope,
            'top_entries' => $this->topEntries,
            'updated_at' => now()->toIso8601String(),
        ];
    }
}
