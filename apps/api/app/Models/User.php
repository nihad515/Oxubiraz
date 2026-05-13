<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Activitylog\Traits\CausesActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use App\Enums\UserRole;
use App\Enums\Locale;
use NotificationChannels\WebPush\HasPushSubscriptions;

class User extends Authenticatable implements MustVerifyEmail, HasMedia
{
    use HasApiTokens;
    use HasFactory;
    use HasRoles;
    use Notifiable;
    use SoftDeletes;
    use CausesActivity;
    use InteractsWithMedia;
    use HasPushSubscriptions;

    protected $fillable = [
        'first_name',
        'last_name',
        'username',
        'email',
        'phone',
        'password',
        'locale',
        'school_id',
        'class_id',
        'teacher_id',
        'parent_id',
        'is_active',
        'xp',
        'level',
        'streak_days',
        'longest_streak',
        'last_played_at',
        'avatar',
        'metadata',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_played_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'xp' => 'integer',
            'level' => 'integer',
            'streak_days' => 'integer',
            'longest_streak' => 'integer',
            'locale' => Locale::class,
            'metadata' => 'array',
        ];
    }

    protected $appends = ['full_name', 'avatar_url'];

    // ───── Accessors ─────

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->getFirstMediaUrl('avatar') ?: null;
    }

    // ───── Relationships ─────

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function students(): HasMany
    {
        return $this->hasMany(User::class, 'teacher_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(User::class, 'parent_id');
    }

    public function gameSessions(): HasMany
    {
        return $this->hasMany(GameSession::class);
    }

    public function achievements(): BelongsToMany
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
            ->withPivot('earned_at')
            ->withTimestamps();
    }

    public function competitions(): BelongsToMany
    {
        return $this->belongsToMany(Competition::class, 'competition_participants')
            ->withPivot(['joined_at', 'score', 'rank'])
            ->withTimestamps();
    }

    // ───── Media ─────

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp'])
            ->registerMediaConversions(function () {
                $this->addMediaConversion('thumb')
                    ->width(100)
                    ->height(100);
                $this->addMediaConversion('medium')
                    ->width(300)
                    ->height(300);
            });
    }

    // ───── Helpers ─────

    public function hasRole(string|array|\BackedEnum|\Spatie\Permission\Contracts\Role $roles, ?string $guard = null): bool
    {
        return parent::hasRole($roles, $guard);
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    public function isAdmin(): bool
    {
        return $this->hasAnyRole(['super_admin', 'admin']);
    }

    public function isTeacher(): bool
    {
        return $this->hasRole('teacher');
    }

    public function isStudent(): bool
    {
        return $this->hasRole('student');
    }

    public function isParent(): bool
    {
        return $this->hasRole('parent');
    }

    public function addXp(int $amount, string $reason): void
    {
        $this->increment('xp', $amount);
        $this->updateLevel();

        XpEvent::create([
            'user_id' => $this->id,
            'amount' => $amount,
            'reason' => $reason,
            'source' => 'game',
        ]);
    }

    private function updateLevel(): void
    {
        $thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000];
        $level = 0;
        foreach ($thresholds as $i => $threshold) {
            if ($this->xp >= $threshold) $level = $i;
            else break;
        }
        if ($this->level !== $level) {
            $this->update(['level' => $level]);
        }
    }

    // ───── Scopes ─────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeBySchool($query, int $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeByClass($query, int $classId)
    {
        return $query->where('class_id', $classId);
    }

    public function scopeByRole($query, string $role)
    {
        return $query->role($role);
    }
}
