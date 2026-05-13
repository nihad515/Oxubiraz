<?php

namespace Database\Seeders;

use App\Models\School;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $school = School::first();
        $class = SchoolClass::first();

        // Demo teacher
        $teacher = User::updateOrCreate(
            ['username' => 'teacher'],
            [
                'first_name' => 'Əli',
                'last_name' => 'Məmmədov',
                'email' => 'teacher@oxubiraz.az',
                'password' => Hash::make('Teacher@123456'),
                'locale' => 'az',
                'is_active' => true,
                'school_id' => $school?->id,
            ]
        );
        $teacher->assignRole('teacher');

        // Demo student
        $student = User::updateOrCreate(
            ['username' => 'student'],
            [
                'first_name' => 'Aytən',
                'last_name' => 'Həsənova',
                'email' => 'student@oxubiraz.az',
                'password' => Hash::make('Student@123456'),
                'locale' => 'az',
                'is_active' => true,
                'school_id' => $school?->id,
                'class_id' => $class?->id,
                'teacher_id' => $teacher->id,
                'xp' => 350,
                'level' => 3,
                'streak_days' => 5,
            ]
        );
        $student->assignRole('student');

        // Demo parent
        $parent = User::updateOrCreate(
            ['username' => 'parent'],
            [
                'first_name' => 'Leyla',
                'last_name' => 'Həsənova',
                'email' => 'parent@oxubiraz.az',
                'password' => Hash::make('Parent@123456'),
                'locale' => 'az',
                'is_active' => true,
            ]
        );
        $parent->assignRole('parent');

        // Link parent to student
        $student->update(['parent_id' => $parent->id]);
    }
}
