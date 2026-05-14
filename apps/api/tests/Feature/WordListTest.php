<?php

use App\Models\User;
use App\Models\Word;
use App\Models\WordList;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');

    $this->student = User::factory()->create();
    $this->student->assignRole('student');

    $this->wordList = WordList::factory()->create(['language' => 'az', 'is_active' => true]);
    Word::factory()->count(5)->create(['word_list_id' => $this->wordList->id]);
});

test('anyone authenticated can list word lists', function () {
    $this->actingAs($this->student)->getJson('/api/v1/word-lists')
        ->assertOk()
        ->assertJsonStructure(['status', 'data', 'meta']);
});

test('anyone authenticated can view a word list', function () {
    $this->actingAs($this->student)->getJson("/api/v1/word-lists/{$this->wordList->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $this->wordList->id);
});

test('anyone authenticated can fetch words for a list', function () {
    $response = $this->actingAs($this->student)->getJson("/api/v1/word-lists/{$this->wordList->id}/words");
    $response->assertOk()->assertJsonStructure(['status', 'data']);
    expect(count($response->json('data')))->toBe(5);
});

test('admin can create a word list', function () {
    $response = $this->actingAs($this->admin)->postJson('/api/v1/word-lists', [
        'name' => 'Test List',
        'language' => 'az',
        'difficulty' => 'beginner',
        'age_group' => '8-10',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Test List');

    expect(WordList::where('name', 'Test List')->exists())->toBeTrue();
});

test('student cannot create a word list', function () {
    $this->actingAs($this->student)->postJson('/api/v1/word-lists', [
        'name' => 'Forbidden List',
        'language' => 'az',
        'difficulty' => 'beginner',
        'age_group' => '8-10',
    ])->assertForbidden();
});

test('admin can update a word list', function () {
    $this->actingAs($this->admin)->patchJson("/api/v1/word-lists/{$this->wordList->id}", [
        'name' => 'Updated Name',
    ])->assertOk()->assertJsonPath('data.name', 'Updated Name');

    expect($this->wordList->fresh()->name)->toBe('Updated Name');
});

test('admin can add words to a list', function () {
    $response = $this->actingAs($this->admin)->postJson(
        "/api/v1/word-lists/{$this->wordList->id}/words",
        ['words' => [['text' => 'yeni'], ['text' => 'söz']]]
    );

    $response->assertCreated();
    expect($this->wordList->words()->count())->toBe(7);
});

test('admin can delete a word list', function () {
    $this->actingAs($this->admin)->deleteJson("/api/v1/word-lists/{$this->wordList->id}")
        ->assertOk();

    expect(WordList::find($this->wordList->id))->toBeNull();
});

test('cannot create word list with invalid language', function () {
    $this->actingAs($this->admin)->postJson('/api/v1/word-lists', [
        'name' => 'Bad',
        'language' => 'fr',
        'difficulty' => 'beginner',
        'age_group' => '8-10',
    ])->assertUnprocessable();
});
