<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class CompetitionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $competitions = QueryBuilder::for(Competition::class)
            ->allowedFilters([
                AllowedFilter::exact('status'),
                AllowedFilter::exact('language'),
            ])
            ->allowedSorts(['starts_at', 'created_at'])
            ->withCount('participants')
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $competitions->items(),
            'meta' => [
                'current_page' => $competitions->currentPage(),
                'last_page' => $competitions->lastPage(),
                'per_page' => $competitions->perPage(),
                'total' => $competitions->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'language' => ['required', 'in:az,ru,en'],
            'starts_at' => ['required', 'date', 'after:now'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'max_participants' => ['sometimes', 'nullable', 'integer', 'min:2'],
            'school_id' => ['sometimes', 'nullable', 'exists:schools,id'],
            'class_id' => ['sometimes', 'nullable', 'exists:school_classes,id'],
        ]);

        $validated['created_by'] = $request->user()->id;
        $competition = Competition::create($validated);

        return response()->json(['status' => 'success', 'data' => $competition], 201);
    }

    public function show(Competition $competition): JsonResponse
    {
        $competition->load('participants')->loadCount('participants');

        return response()->json(['status' => 'success', 'data' => $competition]);
    }

    public function update(Request $request, Competition $competition): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'starts_at' => ['sometimes', 'date'],
            'ends_at' => ['sometimes', 'date', 'after:starts_at'],
            'max_participants' => ['sometimes', 'nullable', 'integer', 'min:2'],
            'status' => ['sometimes', 'in:draft,active,ended,cancelled'],
        ]);

        $competition->update($validated);

        return response()->json(['status' => 'success', 'data' => $competition]);
    }

    public function destroy(Competition $competition): JsonResponse
    {
        $competition->delete();

        return response()->json(['status' => 'success', 'message' => 'Competition deleted.']);
    }

    public function join(Request $request, Competition $competition): JsonResponse
    {
        $user = $request->user();

        if ($competition->status !== 'active') {
            return response()->json(['status' => 'error', 'message' => 'Competition is not active.'], 422);
        }

        if ($competition->max_participants && $competition->participants()->count() >= $competition->max_participants) {
            return response()->json(['status' => 'error', 'message' => 'Competition is full.'], 422);
        }

        $competition->participants()->syncWithoutDetaching([$user->id]);

        return response()->json(['status' => 'success', 'message' => 'Joined competition.']);
    }

    public function leaderboard(Competition $competition): JsonResponse
    {
        $participants = $competition->participants()
            ->orderByPivot('wpm', 'desc')
            ->get()
            ->map(fn ($u, $i) => [
                'rank' => $i + 1,
                'user_id' => $u->id,
                'name' => $u->full_name,
                'wpm' => $u->pivot->wpm,
                'score' => $u->pivot->score,
            ]);

        return response()->json(['status' => 'success', 'data' => $participants]);
    }

    public function active(): JsonResponse
    {
        $competitions = Competition::where('status', 'active')
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>=', now())
            ->withCount('participants')
            ->get();

        return response()->json(['status' => 'success', 'data' => $competitions]);
    }
}
