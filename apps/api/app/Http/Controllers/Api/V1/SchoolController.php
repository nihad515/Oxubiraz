<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\SchoolClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class SchoolController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $schools = QueryBuilder::for(School::class)
            ->allowedFilters([
                AllowedFilter::exact('is_active'),
                AllowedFilter::exact('city'),
                AllowedFilter::partial('name'),
            ])
            ->allowedSorts(['name', 'city', 'created_at'])
            ->withCount(['classes', 'students'])
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $schools->items(),
            'meta' => [
                'current_page' => $schools->currentPage(),
                'last_page' => $schools->lastPage(),
                'per_page' => $schools->perPage(),
                'total' => $schools->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
        ]);

        $school = School::create($validated);

        return response()->json(['status' => 'success', 'data' => $school], 201);
    }

    public function show(School $school): JsonResponse
    {
        $school->loadCount(['classes', 'students']);

        return response()->json(['status' => 'success', 'data' => $school]);
    }

    public function update(Request $request, School $school): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'city' => ['sometimes', 'string', 'max:100'],
            'address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $school->update($validated);

        return response()->json(['status' => 'success', 'data' => $school]);
    }

    public function destroy(School $school): JsonResponse
    {
        $school->delete();

        return response()->json(['status' => 'success', 'message' => 'School deleted.']);
    }

    // School classes nested resource

    public function classes(School $school): JsonResponse
    {
        $classes = $school->classes()->with('teacher')->withCount('students')->get();

        return response()->json(['status' => 'success', 'data' => $classes]);
    }

    public function storeClass(Request $request, School $school): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'grade' => ['required', 'integer', 'min:1', 'max:12'],
            'teacher_id' => ['sometimes', 'nullable', 'exists:users,id'],
        ]);

        $class = $school->classes()->create($validated);

        return response()->json(['status' => 'success', 'data' => $class], 201);
    }
}
