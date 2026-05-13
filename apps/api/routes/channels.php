<?php

use Illuminate\Support\Facades\Broadcast;

// Private per-user channel — only the user themselves may listen
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Public leaderboard channel — any authenticated user may subscribe
Broadcast::channel('leaderboard.{scope}', function ($user) {
    return (bool) $user;
});
