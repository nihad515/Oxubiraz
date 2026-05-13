<?php

namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case Admin = 'admin';
    case Teacher = 'teacher';
    case Student = 'student';
    case Parent = 'parent';

    public function label(): string
    {
        return match($this) {
            self::SuperAdmin => 'Super Admin',
            self::Admin => 'Admin',
            self::Teacher => 'Teacher',
            self::Student => 'Student',
            self::Parent => 'Parent',
        };
    }
}
