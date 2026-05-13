<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SystemString extends Model
{
    use HasFactory;

    protected $fillable = [
        'string_key',
        'group_name',
        'az',
        'ru',
        'en',
        'description',
    ];

    public static function booted(): void
    {
        static::saved(function () {
            static::clearCache();
        });

        static::deleted(function () {
            static::clearCache();
        });
    }

    public static function clearCache(): void
    {
        Cache::forget('strings_az');
        Cache::forget('strings_ru');
        Cache::forget('strings_en');
    }

    public static function getForLocale(string $locale): array
    {
        return Cache::remember("strings_{$locale}", 3600, function () use ($locale) {
            $column = in_array($locale, ['az', 'ru', 'en']) ? $locale : 'az';
            return static::query()
                ->select(['string_key', $column])
                ->get()
                ->pluck($column, 'string_key')
                ->toArray();
        });
    }

    public function scopeByGroup($query, string $group)
    {
        return $query->where('group_name', $group);
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('string_key', 'like', "%{$search}%")
              ->orWhere('az', 'like', "%{$search}%")
              ->orWhere('ru', 'like', "%{$search}%")
              ->orWhere('en', 'like', "%{$search}%");
        });
    }
}
