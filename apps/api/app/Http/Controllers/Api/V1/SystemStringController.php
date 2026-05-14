<?php

namespace App\Http\Controllers\Api\V1;

use App\Exports\SystemStringsExport;
use App\Http\Controllers\Controller;
use App\Models\SystemString;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class SystemStringController extends Controller
{
    public function byLocale(string $locale): JsonResponse
    {
        if (!in_array($locale, ['az', 'ru', 'en'])) {
            return response()->json(['status' => 'error', 'message' => 'Invalid locale'], 422);
        }

        $strings = SystemString::getForLocale($locale);

        return response()->json([
            'status' => 'success',
            'data' => $strings,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $strings = QueryBuilder::for(SystemString::class)
            ->allowedFilters([
                AllowedFilter::partial('string_key'),
                AllowedFilter::exact('group_name'),
                AllowedFilter::scope('search'),
            ])
            ->allowedSorts(['string_key', 'group_name', 'created_at'])
            ->paginate($request->integer('per_page', 25));

        return response()->json([
            'status' => 'success',
            'data' => $strings->items(),
            'meta' => [
                'current_page' => $strings->currentPage(),
                'last_page' => $strings->lastPage(),
                'per_page' => $strings->perPage(),
                'total' => $strings->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'string_key' => ['required', 'string', 'max:100', 'unique:system_strings,string_key', 'regex:/^[a-z0-9_.]+$/'],
            'group_name' => ['required', 'string', 'max:50'],
            'az' => ['required', 'string'],
            'ru' => ['required', 'string'],
            'en' => ['required', 'string'],
            'description' => ['sometimes', 'nullable', 'string'],
        ]);

        $string = SystemString::create($validated);

        return response()->json(['status' => 'success', 'data' => $string], 201);
    }

    public function show(SystemString $string): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => $string]);
    }

    public function update(Request $request, SystemString $string): JsonResponse
    {
        $validated = $request->validate([
            'az' => ['sometimes', 'string'],
            'ru' => ['sometimes', 'string'],
            'en' => ['sometimes', 'string'],
            'group_name' => ['sometimes', 'string', 'max:50'],
            'description' => ['sometimes', 'nullable', 'string'],
        ]);

        $string->update($validated);

        return response()->json(['status' => 'success', 'data' => $string]);
    }

    public function destroy(SystemString $string): JsonResponse
    {
        $string->delete();
        return response()->json(['status' => 'success', 'message' => 'Deleted']);
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'strings' => ['required', 'array'],
            'strings.*.id' => ['required', 'integer', 'exists:system_strings,id'],
            'strings.*.az' => ['sometimes', 'string'],
            'strings.*.ru' => ['sometimes', 'string'],
            'strings.*.en' => ['sometimes', 'string'],
        ]);

        foreach ($validated['strings'] as $item) {
            SystemString::where('id', $item['id'])->update(
                array_filter($item, fn($k) => in_array($k, ['az', 'ru', 'en']), ARRAY_FILTER_USE_KEY)
            );
        }

        SystemString::clearCache();

        return response()->json(['status' => 'success', 'message' => 'Strings updated']);
    }

    public function groups(): JsonResponse
    {
        $groups = SystemString::select('group_name')
            ->distinct()
            ->orderBy('group_name')
            ->pluck('group_name');

        return response()->json(['status' => 'success', 'data' => $groups]);
    }

    public function export(Request $request): mixed
    {
        $format = $request->input('format', 'xlsx');
        $filename = 'strings_' . now()->format('Ymd_His') . '.' . $format;
        $writerType = $format === 'csv' ? \Maatwebsite\Excel\Excel::CSV : \Maatwebsite\Excel\Excel::XLSX;

        return Excel::download(new SystemStringsExport(), $filename, $writerType);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $file = $request->file('file');
        $rows = array_map('str_getcsv', file($file->getPathname()));
        $header = array_shift($rows);
        $count = 0;

        foreach ($rows as $row) {
            $data = array_combine($header, $row);
            if (!empty($data['string_key'])) {
                SystemString::updateOrCreate(
                    ['string_key' => $data['string_key']],
                    array_filter($data, fn($k) => in_array($k, ['group_name', 'az', 'ru', 'en', 'description']), ARRAY_FILTER_USE_KEY),
                );
                $count++;
            }
        }

        SystemString::clearCache();

        return response()->json([
            'status' => 'success',
            'message' => "Imported {$count} strings",
        ]);
    }
}
