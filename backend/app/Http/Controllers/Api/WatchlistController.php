<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Content;
use App\Models\Badge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WatchlistController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $watchlist = $user->watchlist()->with('genres')->get()->map(function ($content) {
            $content->avg_rating = round($content->reviews()->avg('rating'), 1) ?: 0;
            return $content;
        });

        return response()->json($watchlist);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'content_id' => 'required|exists:contents,id',
            'status' => 'required|in:Plan to Watch,Watching,Completed,Dropped',
            'personal_rating' => 'nullable|integer|min:1|max:10',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Attach or update the watchlist pivot
        $user->watchlist()->syncWithoutDetaching([
            $request->content_id => [
                'status' => $request->status,
                'personal_rating' => $request->personal_rating,
                'notes' => $request->notes,
            ]
        ]);

        // Evaluate Badges after watchlist change
        $this->evaluateWatchlistBadges($user);

        $watchlistRecord = $user->watchlist()->where('content_id', $request->content_id)->first();

        return response()->json([
            'message' => 'Watchlist updated successfully',
            'content' => $watchlistRecord
        ]);
    }

    public function destroy(Request $request, $contentId)
    {
        $user = $request->user();
        $user->watchlist()->detach($contentId);

        return response()->json([
            'message' => 'Removed from watchlist successfully'
        ]);
    }

    private function evaluateWatchlistBadges($user)
    {
        // 🥇 Movie Master: Watch 100 movies
        // Count of completed movies
        $completedMoviesCount = $user->watchlist()
            ->where('status', 'Completed')
            ->where('type', 'movie')
            ->count();

        if ($completedMoviesCount >= 100) {
            // Earn Badge ID 2 (Movie Master)
            $user->badges()->syncWithoutDetaching([2 => ['earned_at' => now()]]);
        }
    }
}
