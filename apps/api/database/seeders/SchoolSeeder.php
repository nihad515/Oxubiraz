<?php

namespace Database\Seeders;

use App\Models\School;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Database\Seeder;

class SchoolSeeder extends Seeder
{
    public function run(): void
    {
        $schools = [
            [
                'name' => '1 nömrəli Bakı şəhər məktəbi',
                'city' => 'Bakı',
                'address' => 'İstiqlaliyyət küçəsi, 1',
                'phone' => '+994124931234',
                'email' => 'school1@edu.az',
            ],
            [
                'name' => '6 nömrəli Gəncə şəhər məktəbi',
                'city' => 'Gəncə',
                'address' => 'Həsən Əliyev küçəsi, 6',
                'phone' => '+994222623456',
                'email' => 'school6@edu.az',
            ],
        ];

        foreach ($schools as $schoolData) {
            $school = School::updateOrCreate(['name' => $schoolData['name']], array_merge($schoolData, ['is_active' => true]));

            // Create classes for each school
            for ($grade = 1; $grade <= 4; $grade++) {
                for ($section = 0; $section < 2; $section++) {
                    SchoolClass::updateOrCreate(
                        ['school_id' => $school->id, 'grade' => $grade, 'name' => $grade . chr(65 + $section)],
                        ['school_id' => $school->id, 'grade' => $grade, 'name' => $grade . chr(65 + $section)]
                    );
                }
            }
        }
    }
}
