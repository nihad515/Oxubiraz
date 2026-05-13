<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ReadingText;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class TextController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $texts = QueryBuilder::for(ReadingText::class)
            ->allowedFilters([
                AllowedFilter::exact('language'),
                AllowedFilter::exact('difficulty'),
                AllowedFilter::exact('age_group'),
                AllowedFilter::exact('is_active'),
                AllowedFilter::partial('title'),
            ])
            ->allowedSorts(['title', 'created_at', 'word_count'])
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $texts->items(),
            'meta' => [
                'current_page' => $texts->currentPage(),
                'last_page' => $texts->lastPage(),
                'per_page' => $texts->perPage(),
                'total' => $texts->total(),
            ],
        ]);
    }

    public function show(ReadingText $text): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => $text]);
    }

    public function random(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'language' => ['required', 'in:az,ru,en'],
            'difficulty' => ['sometimes', 'in:beginner,elementary,intermediate,advanced,expert'],
            'age_group' => ['sometimes', 'in:5-7,8-10,11-13,14-16,16+'],
        ]);

        $query = ReadingText::where('language', $validated['language'])
            ->where('is_active', true);

        if (!empty($validated['difficulty'])) {
            $query->where('difficulty', $validated['difficulty']);
        }

        if (!empty($validated['age_group'])) {
            $query->where('age_group', $validated['age_group']);
        }

        $text = $query->inRandomOrder()->first();

        if (!$text) {
            return response()->json(['status' => 'error', 'message' => 'No text found for the given criteria.'], 404);
        }

        return response()->json(['status' => 'success', 'data' => $text]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'min:10'],
            'language' => ['required', 'in:az,ru,en'],
            'difficulty' => ['required', 'in:beginner,elementary,intermediate,advanced,expert'],
            'age_group' => ['required', 'in:5-7,8-10,11-13,14-16,16+'],
            'tags' => ['sometimes', 'array'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        // Auto-calculate word count
        $validated['word_count'] = str_word_count($validated['content']);
        $validated['created_by'] = $request->user()->id;

        $text = ReadingText::create($validated);

        return response()->json(['status' => 'success', 'data' => $text], 201);
    }

    public function update(Request $request, ReadingText $text): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'content' => ['sometimes', 'string', 'min:10'],
            'language' => ['sometimes', 'in:az,ru,en'],
            'difficulty' => ['sometimes', 'in:beginner,elementary,intermediate,advanced,expert'],
            'age_group' => ['sometimes', 'in:5-7,8-10,11-13,14-16,16+'],
            'tags' => ['sometimes', 'array'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if (isset($validated['content'])) {
            $validated['word_count'] = str_word_count($validated['content']);
        }

        $text->update($validated);

        return response()->json(['status' => 'success', 'data' => $text]);
    }

    public function destroy(ReadingText $text): JsonResponse
    {
        $text->delete();

        return response()->json(['status' => 'success', 'message' => 'Text deleted.']);
    }
}
