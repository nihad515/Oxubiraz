<?php

namespace App\Enums;

enum Locale: string
{
    case Az = 'az';
    case Ru = 'ru';
    case En = 'en';

    public function label(): string
    {
        return match($this) {
            self::Az => 'Azərbaycan',
            self::Ru => 'Русский',
            self::En => 'English',
        };
    }

    public function flag(): string
    {
        return match($this) {
            self::Az => '🇦🇿',
            self::Ru => '🇷🇺',
            self::En => '🇬🇧',
        };
    }
}
