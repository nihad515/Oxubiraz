<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolePermissionSeeder extends Seeder
{
    private array $permissions = [
        // Users
        'manage_users' => 'users',
        'view_users' => 'users',
        'create_users' => 'users',
        'edit_users' => 'users',
        'delete_users' => 'users',

        // Schools
        'manage_schools' => 'schools',
        'view_schools' => 'schools',

        // Content
        'manage_texts' => 'texts',
        'view_texts' => 'texts',
        'manage_words' => 'words',
        'view_words' => 'words',

        // Strings
        'manage_strings' => 'strings',
        'view_strings' => 'strings',

        // Statistics
        'manage_statistics' => 'statistics',
        'view_statistics' => 'statistics',
        'view_own_statistics' => 'statistics',

        // Languages
        'manage_languages' => 'languages',

        // Competitions
        'manage_competitions' => 'competitions',
        'participate_competitions' => 'competitions',

        // Achievements
        'manage_achievements' => 'achievements',

        // Notifications
        'manage_notifications' => 'notifications',

        // Parent
        'view_children' => 'parent',

        // Settings
        'manage_settings' => 'settings',

        // Roles
        'manage_roles' => 'roles',
        'assign_roles' => 'roles',

        // Game
        'play_game' => 'game',

        // Reports
        'view_reports' => 'reports',
        'export_reports' => 'reports',
    ];

    private array $roles = [
        'super_admin' => '*', // All permissions
        'admin' => [
            'manage_users', 'view_users', 'create_users', 'edit_users', 'delete_users',
            'manage_schools', 'view_schools',
            'manage_texts', 'view_texts',
            'manage_words', 'view_words',
            'manage_strings', 'view_strings',
            'manage_statistics', 'view_statistics',
            'manage_competitions',
            'manage_achievements',
            'manage_notifications',
            'view_reports', 'export_reports',
        ],
        'teacher' => [
            'view_users', 'create_users',
            'view_schools',
            'view_texts', 'view_words',
            'view_own_statistics', 'view_statistics',
            'manage_competitions', 'participate_competitions',
            'play_game',
            'view_reports', 'export_reports',
        ],
        'student' => [
            'view_own_statistics',
            'participate_competitions',
            'play_game',
        ],
        'parent' => [
            'view_own_statistics',
            'view_children',
        ],
    ];

    public function run(): void
    {
        // Create all permissions
        foreach ($this->permissions as $name => $group) {
            Permission::firstOrCreate(
                ['name' => $name, 'guard_name' => 'web'],
            );
        }

        // Create roles and assign permissions
        foreach ($this->roles as $roleName => $perms) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);

            if ($perms === '*') {
                $role->syncPermissions(Permission::all());
            } else {
                $role->syncPermissions($perms);
            }
        }

        // Create default super admin
        $admin = User::firstOrCreate(
            ['username' => 'superadmin'],
            [
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'email' => 'admin@oxubiraz.az',
                'password' => bcrypt('Admin@123456'),
                'locale' => 'az',
                'is_active' => true,
                'xp' => 0,
                'level' => 0,
                'streak_days' => 0,
                'longest_streak' => 0,
                'email_verified_at' => now(),
            ]
        );

        $admin->assignRole('super_admin');

        $this->command->info('Roles and permissions seeded successfully.');
    }
}
