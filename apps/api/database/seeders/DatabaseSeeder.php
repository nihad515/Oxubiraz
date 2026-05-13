<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            SystemStringSeeder::class,
            SchoolSeeder::class,
            UserSeeder::class,
            WordListSeeder::class,
            AchievementSeeder::class,
        ]);
    }
}
