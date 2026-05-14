<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\AdminBroadcast;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'status' => 'success',
            'data' => $notifications->items(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'unread_count' => $request->user()->unreadNotifications()->count(),
            ],
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => ['unread_count' => $request->user()->unreadNotifications()->count()],
        ]);
    }

    public function markRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json(['status' => 'success', 'message' => 'Notification marked as read.']);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['status' => 'success', 'message' => 'All notifications marked as read.']);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $request->user()->notifications()->findOrFail($id)->delete();

        return response()->json(['status' => 'success', 'message' => 'Notification deleted.']);
    }

    public function destroyAll(Request $request): JsonResponse
    {
        $request->user()->notifications()->delete();

        return response()->json(['status' => 'success', 'message' => 'All notifications deleted.']);
    }

    public function broadcast(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'   => ['required', 'string', 'max:100'],
            'message' => ['required', 'string', 'max:500'],
            'target'  => ['required', 'in:all,students,teachers,parents'],
        ]);

        $query = User::active();

        if ($validated['target'] !== 'all') {
            $role = rtrim($validated['target'], 's'); // students→student, teachers→teacher, parents→parent
            $query->role($role);
        }

        $recipients = $query->get();

        Notification::send($recipients, new AdminBroadcast(
            title: $validated['title'],
            message: $validated['message'],
        ));

        return response()->json([
            'status' => 'success',
            'message' => 'Broadcast queued.',
            'data' => ['sent' => $recipients->count()],
        ]);
    }
}
