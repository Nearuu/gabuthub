<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ost;
use Illuminate\Http\Request;

class OstController extends Controller
{
    public function toggleLike(Request $request, $id)
    {
        $user = $request->user();
        $ost = Ost::find($id);

        if (!$ost) {
            return response()->json(['message' => 'OST not found'], 404);
        }

        $liked = $ost->likes()->toggle($user->id);
        $isLiked = count($liked['attached']) > 0;

        return response()->json([
            'message' => $isLiked ? 'OST liked' : 'OST unliked',
            'is_liked' => $isLiked,
            'likes_count' => $ost->likes()->count()
        ]);
    }

    public function toggleVote(Request $request, $id)
    {
        $user = $request->user();
        $ost = Ost::find($id);

        if (!$ost) {
            return response()->json(['message' => 'OST not found'], 404);
        }

        $voted = $ost->votes()->toggle($user->id);
        $isVoted = count($voted['attached']) > 0;

        return response()->json([
            'message' => $isVoted ? 'Voted for OST' : 'Unvoted OST',
            'is_voted' => $isVoted,
            'votes_count' => $ost->votes()->count()
        ]);
    }

    public function updateOst(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin role required.'], 403);
        }

        $ost = Ost::find($id);
        if (!$ost) {
            return response()->json(['message' => 'OST not found'], 404);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'artist' => 'required|string|max:255',
            'preview_url' => 'nullable|string',
        ]);

        $ost->update([
            'title' => $request->title,
            'artist' => $request->artist,
            'preview_url' => $request->preview_url ?: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        ]);

        return response()->json([
            'message' => 'OST updated successfully',
            'ost' => $ost
        ]);
    }

    public function destroyOst(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin role required.'], 403);
        }

        $ost = Ost::find($id);
        if (!$ost) {
            return response()->json(['message' => 'OST not found'], 404);
        }

        $ost->delete();

        return response()->json([
            'message' => 'OST deleted successfully'
        ]);
    }

    /**
     * Get dynamic questions for Guess The OST game
     */
    public function getGuessOstGame(Request $request)
    {
        $settingsPath = storage_path('app/game_settings.json');
        $seconds = 15;
        $count = 10;

        if (file_exists($settingsPath)) {
            $settings = json_decode(file_get_contents($settingsPath), true);
            $seconds = $settings['guess_ost_seconds'] ?? 15;
            $count = $settings['guess_ost_count'] ?? 10;
        }

        $allOsts = Ost::with('content')->whereNotNull('preview_url')->where('preview_url', '!=', '')->get();

        if ($allOsts->count() < 4) {
            return response()->json([
                'seconds_per_question' => $seconds,
                'questions' => []
            ]);
        }

        $shuffled = $allOsts->shuffle()->take($count);
        $questions = [];

        foreach ($shuffled as $target) {
            $targetTitle = $target->title;
            $targetArtist = $target->artist;
            $contentTitle = $target->content ? $target->content->title : '';

            // Generate 3 wrong options from other OSTs
            $wrongOsts = $allOsts->where('id', '!=', $target->id)->shuffle()->take(3);
            
            $options = [
                [
                    'id' => $target->id,
                    'text' => $targetTitle . ' - ' . $targetArtist,
                    'is_correct' => true
                ]
            ];

            foreach ($wrongOsts as $wrong) {
                $options[] = [
                    'id' => $wrong->id,
                    'text' => $wrong->title . ' - ' . $wrong->artist,
                    'is_correct' => false
                ];
            }

            shuffle($options);

            $questions[] = [
                'id' => $target->id,
                'preview_url' => $target->preview_url,
                'options' => $options
            ];
        }

        return response()->json([
            'seconds_per_question' => $seconds,
            'questions' => $questions
        ]);
    }

    /**
     * Get game settings for admin
     */
    public function getGameSettings(Request $request)
    {
        $settingsPath = storage_path('app/game_settings.json');
        $default = [
            'guess_ost_seconds' => 15,
            'guess_ost_count' => 10
        ];

        if (file_exists($settingsPath)) {
            $settings = json_decode(file_get_contents($settingsPath), true);
            return response()->json(array_merge($default, $settings ?: []));
        }

        return response()->json($default);
    }

    /**
     * Save game settings (Admin only)
     */
    public function saveGameSettings(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin role required.'], 403);
        }

        $request->validate([
            'guess_ost_seconds' => 'required|integer|min:5|max:60',
            'guess_ost_count' => 'required|integer|min:3|max:30',
        ]);

        $settingsPath = storage_path('app/game_settings.json');
        $data = [
            'guess_ost_seconds' => (int) $request->guess_ost_seconds,
            'guess_ost_count' => (int) $request->guess_ost_count,
            'updated_at' => now()->toDateTimeString()
        ];

        file_put_contents($settingsPath, json_encode($data, JSON_PRETTY_PRINT));

        return response()->json([
            'message' => 'Game settings saved successfully',
            'settings' => $data
        ]);
    }
}
