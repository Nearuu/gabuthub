<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TierList;
use App\Models\TierRow;
use App\Models\TierItem;
use App\Models\Badge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TierListController extends Controller
{
    public function index(Request $request)
    {
        $tierLists = TierList::with(['user', 'rows.items.content'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($tierList) use ($request) {
                $user = $request->user('sanctum');
                $tierList->is_liked = $user ? $tierList->likes()->where('user_id', $user->id)->exists() : false;
                $tierList->likes_count = $tierList->likes()->count();
                return $tierList;
            });

        return response()->json($tierLists);
    }

    public function store(Request $request)
    {
        $user = $request->user() ?: \App\Models\User::where('email', $request->email)->first() ?: \App\Models\User::find($request->user_id) ?: \App\Models\User::first();

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|min:3|max:255',
            'category' => 'nullable|string|max:100',
            'rows' => 'required|array|min:1',
            'rows.*.label' => 'required|string|max:20',
            'rows.*.items' => 'present|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tierList = DB::transaction(function () use ($user, $request) {
            // Create tier list header
            $tierList = TierList::create([
                'user_id' => $user ? $user->id : 1,
                'title' => $request->title,
                'category' => $request->category ?: 'General',
            ]);

            // Create rows and items
            foreach ($request->rows as $rowData) {
                $row = TierRow::create([
                    'tier_list_id' => $tierList->id,
                    'label' => $rowData['label'],
                ]);

                foreach ($rowData['items'] as $contentId) {
                    TierItem::create([
                        'row_id' => $row->id,
                        'content_id' => $contentId,
                    ]);
                }
            }

            return $tierList;
        });

        if ($user) {
            $this->evaluateTierBadges($user);
        }

        return response()->json([
            'message' => 'Tier list published successfully',
            'tier_list' => $tierList->load('rows.items.content')
        ], 201);
    }

    public function toggleLike(Request $request, $id)
    {
        $user = $request->user() ?: \App\Models\User::where('email', $request->email)->first() ?: \App\Models\User::find($request->user_id) ?: \App\Models\User::first();
        $tierList = TierList::find($id);

        if (!$tierList) {
            return response()->json(['message' => 'Tier list not found'], 404);
        }

        $userId = $user ? $user->id : 1;
        $liked = $tierList->likes()->toggle($userId);
        $isLiked = count($liked['attached']) > 0;

        return response()->json([
            'message' => $isLiked ? 'Tier list liked' : 'Tier list unliked',
            'is_liked' => $isLiked,
            'likes_count' => $tierList->likes()->count()
        ]);
    }

    public function destroyTierList($id)
    {
        $tierList = TierList::findOrFail($id);
        $tierList->delete();
        return response()->json(['message' => 'Tier List berhasil dihapus oleh Admin!']);
    }

    private function evaluateTierBadges($user)
    {
        // 🏆 Tier Legend: Create 10 tier lists
        $tierListsCount = $user->tierLists()->count();

        if ($tierListsCount >= 10) {
            $user->badges()->syncWithoutDetaching([3 => ['earned_at' => now()]]);
        }
    }
}
