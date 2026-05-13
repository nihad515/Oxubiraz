<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'username' => $this->username,
            'email' => $this->email,
            'phone' => $this->phone,
            'locale' => $this->locale,
            'avatar' => $this->avatar_url,
            'role' => $this->roles->first()?->name,
            'roles' => $this->whenLoaded('roles', fn() =>
                $this->roles->map(fn($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => $role->name,
                ])
            ),
            'permissions' => $this->whenLoaded('roles', fn() =>
                $this->getAllPermissions()->pluck('name')
            ),
            'school_id' => $this->school_id,
            'class_id' => $this->class_id,
            'teacher_id' => $this->teacher_id,
            'parent_id' => $this->parent_id,
            'is_active' => $this->is_active,
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'xp' => $this->xp,
            'level' => $this->level,
            'streak_days' => $this->streak_days,
            'longest_streak' => $this->longest_streak,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
