<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Word;
use App\Models\WordList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class WordListController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $lists = QueryBuilder::for(WordList::class)
            ->allowedFilters([
                AllowedFilter::exact('language'),
                AllowedFilter::exact('difficulty'),
                AllowedFilter::exact('age_group'),
                AllowedFilter::exact('is_active'),
                AllowedFilter::partial('name'),
            ])
            ->allowedSorts(['name', 'created_at', 'words_count'])
            ->withCount('words')
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $lists->items(),
            'meta' => [
                'current_page' => $lists->currentPage(),
                'last_page' => $lists->lastPage(),
                'per_page' => $lists->perPage(),
                'total' => $lists->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'language' => ['required', 'in:az,ru,en'],
            'difficulty' => ['required', 'in:beginner,elementary,intermediate,advanced,expert'],
            'age_group' => ['required', 'in:5-7,8-10,11-13,14-16,16+'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $list = WordList::create($validated);

        return response()->json(['status' => 'success', 'data' => $list], 201);
    }

    public function show(WordList $wordList): JsonResponse
    {
        $wordList->loadCount('words');

        return response()->json(['status' => 'success', 'data' => $wordList]);
    }

    public function update(Request $request, WordList $wordList): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'language' => ['sometimes', 'in:az,ru,en'],
            'difficulty' => ['sometimes', 'in:beginner,elementary,intermediate,advanced,expert'],
            'age_group' => ['sometimes', 'in:5-7,8-10,11-13,14-16,16+'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $wordList->update($validated);

        return response()->json(['status' => 'success', 'data' => $wordList]);
    }

    public function destroy(WordList $wordList): JsonResponse
    {
        $wordList->delete();

        return response()->json(['status' => 'success', 'message' => 'Word list deleted.']);
    }

    public function words(WordList $wordList): JsonResponse
    {
        $words = $wordList->words()->orderBy('frequency', 'desc')->get();

        return response()->json(['status' => 'success', 'data' => $words]);
    }

    public function addWords(Request $request, WordList $wordList): JsonResponse
    {
        $validated = $request->validate([
            'words' => ['required', 'array', 'min:1'],
            'words.*.text' => ['required', 'string', 'max:100'],
            'words.*.syllable_count' => ['sometimes', 'integer', 'min:1'],
            'words.*.frequency' => ['sometimes', 'integer', 'min:1'],
        ]);

        $created = collect($validated['words'])->map(fn ($w) => array_merge($w, [
            'word_list_id' => $wordList->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]));

        Word::insert($created->toArray());

        return response()->json([
            'status' => 'success',
            'message' => count($validated['words']) . ' words added.',
        ], 201);
    }

    public function removeWord(WordList $wordList, Word $word): JsonResponse
    {
        $word->delete();

        return response()->json(['status' => 'success', 'message' => 'Word removed.']);
    }
}
