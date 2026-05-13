<?php

use App\Models\User;
use App\Models\School;
use App\Models\SchoolClass;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

    $this->school = School::factory()->create();
    $this->class = SchoolClass::factory()->create(['school_id' => $this->school->id]);

    $this->student = User::factory()->create([
        'school_id' => $this->school->id,
        'class_id' => $this->class->id,
        'xp' => 500,
        'level' => 3,
    ]);
    $this->student->assignRole('student');
});

test('student can view global leaderboard', function () {
    $response = $this->actingAs($this->student)->getJson('/api/v1/leaderboard/global');

    $response->assertOk()
        ->assertJsonStructure(['status', 'data']);
});

test('global leaderboard entries have expected fields', function () {
    User::factory()->count(5)->create(['xp' => 1000])->each(fn ($u) => $u->assignRole('student'));

    $response = $this->actingAs($this->student)->getJson('/api/v1/leaderboard/global?type=xp&period=all');

    $response->assertOk();
    $data = $response->json('data');
    expect($data)->not->toBeEmpty();
    expect($data[0])->toHaveKeys(['rank', 'user_id', 'name', 'xp', 'level']);
});

test('student can view school leaderboard', function () {
    $response = $this->actingAs($this->student)->getJson('/api/v1/leaderboard/school');

    $response->assertOk()
        ->assertJsonStructure(['status', 'data']);
});

test('school leaderboard only shows users from same school', function () {
    $otherSchool = School::factory()->create();
    $outsider = User::factory()->create(['school_id' => $otherSchool->id, 'xp' => 9999]);
    $outsider->assignRole('student');

    $response = $this->actingAs($this->student)->getJson('/api/v1/leaderboard/school');

    $ids = collect($response->json('data'))->pluck('user_id');
    expect($ids)->not->toContain($outsider->id);
});

test('student can view class leaderboard', function () {
    $response = $this->actingAs($this->student)->getJson('/api/v1/leaderboard/class');

    $response->assertOk()
        ->assertJsonStructure(['status', 'data']);
});

test('class leaderboard only shows users from same class', function () {
    $otherClass = SchoolClass::factory()->create(['school_id' => $this->school->id]);
    $outsider = User::factory()->create([
        'school_id' => $this->school->id,
        'class_id' => $otherClass->id,
        'xp' => 9999,
    ]);
    $outsider->assignRole('student');

    $response = $this->actingAs($this->student)->getJson('/api/v1/leaderboard/class');

    $ids = collect($response->json('data'))->pluck('user_id');
    expect($ids)->not->toContain($outsider->id);
});

test('global leaderboard can be sorted by wpm type', function () {
    $this->actingAs($this->student)
        ->getJson('/api/v1/leaderboard/global?type=wpm')
        ->assertOk();
});

test('global leaderboard supports period filter', function () {
    foreach (['week', 'month', 'year', 'all'] as $period) {
        $this->actingAs($this->student)
            ->getJson("/api/v1/leaderboard/global?period={$period}")
            ->assertOk();
    }
});

test('unauthenticated user cannot view leaderboard', function () {
    $this->getJson('/api/v1/leaderboard/global')->assertUnauthorized();
});

test('user without school sees empty school leaderboard', function () {
    $noSchoolUser = User::factory()->create(['school_id' => null]);
    $noSchoolUser->assignRole('student');

    $response = $this->actingAs($noSchoolUser)->getJson('/api/v1/leaderboard/school');
    $response->assertOk();
    expect($response->json('data'))->toBeEmpty();
});
