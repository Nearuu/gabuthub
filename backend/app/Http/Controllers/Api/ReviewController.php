<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Content;
use App\Models\Review;
use App\Models\Badge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    public function store(Request $request, $contentId)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:10',
            'review' => 'required|string|min:5|max:2000',
            'spoiler' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Create or update review
        $review = Review::updateOrCreate(
            [
                'user_id' => $user->id,
                'content_id' => $contentId,
            ],
            [
                'rating' => $request->rating,
                'review' => $request->review,
                'spoiler' => $request->spoiler,
            ]
        );

        // Evaluate Badges
        $this->evaluateReviewBadges($user);

        return response()->json([
            'message' => 'Review submitted successfully',
            'review' => $review->load('user')
        ]);
    }

    public function toggleLike(Request $request, $id)
    {
        $user = $request->user();
        $review = Review::find($id);

        if (!$review) {
            return response()->json(['message' => 'Review not found'], 404);
        }

        $liked = $review->likes()->toggle($user->id);
        $isLiked = count($liked['attached']) > 0;

        return response()->json([
            'message' => $isLiked ? 'Review liked' : 'Review unliked',
            'is_liked' => $isLiked,
            'likes_count' => $review->likes()->count()
        ]);
    }

    public function listReviews()
    {
        $reviews = Review::with(['user', 'content'])->orderBy('id', 'desc')->get();
        return response()->json($reviews);
    }

    public function destroyReview($id)
    {
        $review = Review::findOrFail($id);
        $review->delete();
        return response()->json(['message' => 'Review ulasan pengguna berhasil dihapus oleh Admin!']);
    }

    private function evaluateReviewBadges($user)
    {
        $totalReviews = $user->reviews()->count();

        // 💬 Reviewer: Write 50 reviews
        if ($totalReviews >= 50) {
            $user->badges()->syncWithoutDetaching([4 => ['earned_at' => now()]]);
        }

        // 🥇 Drakor Addict: Review 20 drakors (contents where type = drama)
        $drakorReviewsCount = $user->reviews()
            ->whereHas('content', function ($q) {
                $q->where('type', 'drama');
            })
            ->count();

        if ($drakorReviewsCount >= 20) {
            $user->badges()->syncWithoutDetaching([1 => ['earned_at' => now()]]);
        }
    }
}
