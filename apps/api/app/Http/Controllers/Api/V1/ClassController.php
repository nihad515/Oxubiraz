<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassController extends Controller
{
    public function show(SchoolClass $class): JsonResponse
    {
        $class->load(['school', 'teacher'])->loadCount('students');

        return response()->json(['status' => 'success', 'data' => $class]);
    }

    public function update(Request $request, SchoolClass $class): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'grade' => ['sometimes', 'integer', 'min:1', 'max:12'],
            'teacher_id' => ['sometimes', 'nullable', 'exists:users,id'],
        ]);

        $class->update($validated);

        return response()->json(['status' => 'success', 'data' => $class]);
    }

    public function destroy(SchoolClass $class): JsonResponse
    {
        $class->delete();

        return response()->json(['status' => 'success', 'message' => 'Class deleted.']);
    }

    public function students(SchoolClass $class): JsonResponse
    {
        $students = $class->students()->with('roles')->latest()->get();

        return response()->json([
            'status' => 'success',
            'data' => UserResource::collection($students),
        ]);
    }

    public function bySchool(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'school_id' => ['required', 'exists:schools,id'],
        ]);

        $classes = SchoolClass::where('school_id', $validated['school_id'])
            ->withCount('students')
            ->orderBy('grade')
            ->orderBy('name')
            ->get();

        return response()->json(['status' => 'success', 'data' => $classes]);
    }
}
