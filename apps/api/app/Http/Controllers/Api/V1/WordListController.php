<?php

namespace App\Http\Controllers\Api\V1;

use App\Exports\WordListExport;
use App\Http\Controllers\Controller;
use App\Models\Word;
use App\Models\WordList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
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

    public function importWords(Request $request, WordList $wordList): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $path = $request->file('file')->getRealPath();
        $handle = fopen($path, 'r');

        if ($handle === false) {
            return response()->json(['status' => 'error', 'message' => 'Cannot read file.'], 422);
        }

        $header = fgetcsv($handle);
        if (!$header) {
            fclose($handle);
            return response()->json(['status' => 'error', 'message' => 'Empty file.'], 422);
        }

        // Normalize header names — accept 'word'/'text', optional syllable_count/frequency
        $header = array_map(fn ($h) => strtolower(trim($h)), $header);
        $textCol = array_search('text', $header) !== false
            ? array_search('text', $header)
            : array_search('word', $header);

        if ($textCol === false) {
            fclose($handle);
            return response()->json([
                'status' => 'error',
                'message' => 'CSV must contain a "text" or "word" column.',
            ], 422);
        }

        $syllableCol = array_search('syllable_count', $header);
        $frequencyCol = array_search('frequency', $header);

        $rows = [];
        $skipped = 0;
        $now = now()->toDateTimeString();

        while (($row = fgetcsv($handle)) !== false) {
            $text = trim($row[$textCol] ?? '');

            if ($text === '' || mb_strlen($text) > 100) {
                $skipped++;
                continue;
            }

            $rows[] = [
                'word_list_id' => $wordList->id,
                'text' => $text,
                'syllable_count' => $syllableCol !== false && isset($row[$syllableCol])
                    ? (int) $row[$syllableCol] ?: null
                    : null,
                'frequency' => $frequencyCol !== false && isset($row[$frequencyCol])
                    ? (int) $row[$frequencyCol] ?: 1
                    : 1,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        fclose($handle);

        if (empty($rows)) {
            return response()->json(['status' => 'error', 'message' => 'No valid words found in CSV.'], 422);
        }

        // Chunk inserts to avoid hitting DB parameter limits
        collect($rows)->chunk(500)->each(fn ($chunk) => Word::insert($chunk->toArray()));

        return response()->json([
            'status' => 'success',
            'message' => count($rows) . ' words imported, ' . $skipped . ' skipped.',
            'data' => ['imported' => count($rows), 'skipped' => $skipped],
        ], 201);
    }

    public function exportWords(Request $request, WordList $wordList): mixed
    {
        $format = $request->input('format', 'xlsx');
        $filename = 'words_' . str($wordList->name)->slug() . '_' . now()->format('Ymd') . '.' . $format;
        $writerType = $format === 'csv' ? \Maatwebsite\Excel\Excel::CSV : \Maatwebsite\Excel\Excel::XLSX;

        return Excel::download(new WordListExport($wordList), $filename, $writerType);
    }
}
