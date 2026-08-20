<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Poll;
use App\Models\PollOption;
use App\Models\Badge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PollController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user('sanctum');

        $polls = Poll::with('options')->get()->map(function ($poll) use ($user) {
            $totalVotes = 0;
            $userVotedOptionId = null;

            foreach ($poll->options as $option) {
                $option->votes_count = $option->votes()->count();
                $totalVotes += $option->votes_count;

                if ($user && $option->votes()->where('user_id', $user->id)->exists()) {
                    $userVotedOptionId = $option->id;
                }
            }

            $poll->total_votes = $totalVotes;
            $poll->user_voted_option_id = $userVotedOptionId;
            $poll->is_active = now()->lt($poll->ends_at);

            return $poll;
        });

        return response()->json($polls);
    }

    public function vote(Request $request, $pollId)
    {
        $user = $request->user() ?: \App\Models\User::where('email', $request->email)->first() ?: \App\Models\User::find($request->user_id) ?: \App\Models\User::first();
        $poll = Poll::find($pollId);

        if (!$poll) {
            return response()->json(['message' => 'Poll not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'option_id' => 'required|exists:poll_options,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userId = $user ? $user->id : 1;

        // Check if user already voted in this poll
        $existingVote = DB::table('poll_votes')
            ->join('poll_options', 'poll_votes.option_id', '=', 'poll_options.id')
            ->where('poll_options.poll_id', $pollId)
            ->where('poll_votes.user_id', $userId)
            ->first();

        if ($existingVote) {
            // Remove previous vote to allow changing vote
            DB::table('poll_votes')
                ->where('option_id', $existingVote->option_id)
                ->where('user_id', $userId)
                ->delete();
        }

        // Cast new vote
        DB::table('poll_votes')->insert([
            'user_id' => $userId,
            'option_id' => $request->option_id,
        ]);

        if ($user) {
            $this->evaluateVotingBadges($user);
        }

        return response()->json([
            'message' => 'Vote submitted successfully'
        ]);
    }

    private function evaluateVotingBadges($user)
    {
        // 🔥 Top Voter: Vote 500 times
        $votesCount = DB::table('poll_votes')->where('user_id', $user->id)->count();

        if ($votesCount >= 500) {
            $user->badges()->syncWithoutDetaching([6 => ['earned_at' => now()]]);
        }
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin role required.'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'ends_at' => 'required|date',
            'options' => 'required|array|min:2',
            'options.*' => 'required|string|max:255',
        ]);

        $poll = Poll::create([
            'title' => $request->title,
            'description' => $request->description,
            'ends_at' => $request->ends_at,
        ]);

        foreach ($request->options as $optionText) {
            $poll->options()->create(['option_text' => $optionText]);
        }

        return response()->json([
            'message' => 'Poll created successfully',
            'poll' => $poll->load('options')
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin role required.'], 403);
        }

        $poll = Poll::find($id);
        if (!$poll) {
            return response()->json(['message' => 'Poll not found'], 404);
        }

        $poll->delete();

        return response()->json([
            'message' => 'Poll deleted successfully'
        ]);
    }

    // GAME HOT TAKES CRUD
    public function listHotTakes()
    {
        return response()->json(\App\Models\GameHotTake::orderBy('id', 'desc')->get());
    }

    public function storeHotTake(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin role required.'], 403);
        }

        $request->validate([
            'text' => 'required|string',
            'category' => 'required|string',
        ]);

        $ht = \App\Models\GameHotTake::create([
            'text' => $request->text,
            'category' => $request->category,
        ]);

        return response()->json([
            'message' => 'Hot Take created successfully',
            'hot_take' => $ht
        ], 201);
    }

    public function updateHotTake(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin role required.'], 403);
        }

        $ht = \App\Models\GameHotTake::find($id);
        if (!$ht) {
            return response()->json(['message' => 'Hot Take not found'], 404);
        }

        $request->validate([
            'text' => 'required|string',
            'category' => 'required|string',
        ]);

        $ht->update([
            'text' => $request->text,
            'category' => $request->category,
        ]);

        return response()->json([
            'message' => 'Hot Take updated successfully',
            'hot_take' => $ht
        ]);
    }

    public function destroyHotTake(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin role required.'], 403);
        }

        $ht = \App\Models\GameHotTake::find($id);
        if (!$ht) {
            return response()->json(['message' => 'Hot Take not found'], 404);
        }

        $ht->delete();

        return response()->json([
            'message' => 'Hot Take deleted successfully'
        ]);
    }

    // GAME FLAG CHARACTERS CRUD
    public function listFlagCharacters()
    {
        return response()->json(\App\Models\GameCharacter::orderBy('id', 'desc')->get());
    }

    public function storeFlagCharacter(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin role required.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'series' => 'required|string|max:255',
            'description' => 'required|string',
            'avatar' => 'required|url',
        ]);

        $char = \App\Models\GameCharacter::create([
            'name' => $request->name,
            'series' => $request->series,
            'description' => $request->description,
            'avatar' => $request->avatar,
        ]);

        return response()->json([
            'message' => 'Character created successfully',
            'character' => $char
        ], 201);
    }

    public function updateFlagCharacter(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin role required.'], 403);
        }

        $char = \App\Models\GameCharacter::find($id);
        if (!$char) {
            return response()->json(['message' => 'Character not found'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'series' => 'required|string|max:255',
            'description' => 'required|string',
            'avatar' => 'required|url',
        ]);

        $char->update([
            'name' => $request->name,
            'series' => $request->series,
            'description' => $request->description,
            'avatar' => $request->avatar,
        ]);

        return response()->json([
            'message' => 'Character updated successfully',
            'character' => $char
        ]);
    }

    public function destroyFlagCharacter(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin role required.'], 403);
        }

        $char = \App\Models\GameCharacter::find($id);
        if (!$char) {
            return response()->json(['message' => 'Character not found'], 404);
        }

        $char->delete();

        return response()->json([
            'message' => 'Character deleted successfully'
        ]);
    }
}
