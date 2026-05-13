<?php

use App\Models\User;
use App\Models\School;
use App\Models\SchoolClass;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);
});

test('user can login with username', function () {
    $user = User::factory()->create(['password' => bcrypt('Password@123')]);
    $user->assignRole('student');

    $response = $this->postJson('/api/v1/auth/login', [
        'login' => $user->username,
        'password' => 'Password@123',
        'device_name' => 'test',
    ]);

    $response->assertOk()
        ->assertJsonStructure([
            'status',
            'data' => ['access_token', 'token_type', 'expires_at', 'user'],
        ])
        ->assertJson(['status' => 'success']);
});

test('user cannot login with wrong password', function () {
    $user = User::factory()->create(['password' => bcrypt('correct_password')]);

    $response = $this->postJson('/api/v1/auth/login', [
        'login' => $user->username,
        'password' => 'wrong_password',
    ]);

    $response->assertStatus(422);
});

test('inactive user cannot login', function () {
    $user = User::factory()->create([
        'password' => bcrypt('Password@123'),
        'is_active' => false,
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'login' => $user->username,
        'password' => 'Password@123',
    ]);

    $response->assertStatus(422);
});

test('student can register', function () {
    $school = School::factory()->create();
    $class = SchoolClass::factory()->create(['school_id' => $school->id]);

    $response = $this->postJson('/api/v1/auth/register', [
        'first_name' => 'Test',
        'last_name' => 'Student',
        'username' => 'test_student_new',
        'password' => 'Password@123',
        'password_confirmation' => 'Password@123',
        'role' => 'student',
        'school_id' => $school->id,
        'class_id' => $class->id,
        'locale' => 'az',
    ]);

    $response->assertCreated()
        ->assertJsonStructure([
            'data' => ['access_token', 'user'],
        ]);

    expect(User::where('username', 'test_student_new')->exists())->toBeTrue();
});

test('authenticated user can get their profile', function () {
    $user = User::factory()->create();
    $user->assignRole('student');

    $response = $this->actingAs($user)->getJson('/api/v1/auth/me');

    $response->assertOk()
        ->assertJson(['status' => 'success'])
        ->assertJsonPath('data.username', $user->username);
});

test('user can logout', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withToken($token)->postJson('/api/v1/auth/logout');

    $response->assertOk();

    // Token should be revoked
    $this->withToken($token)
        ->getJson('/api/v1/auth/me')
        ->assertUnauthorized();
});

test('login is rate limited', function () {
    $user = User::factory()->create();

    for ($i = 0; $i < 12; $i++) {
        $this->postJson('/api/v1/auth/login', [
            'login' => $user->username,
            'password' => 'wrong_password',
        ]);
    }

    $response = $this->postJson('/api/v1/auth/login', [
        'login' => $user->username,
        'password' => 'wrong_password',
    ]);

    $response->assertStatus(429);
});
