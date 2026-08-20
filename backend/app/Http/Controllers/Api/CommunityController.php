<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\Badge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CommunityController extends Controller
{
    public function index(Request $request)
    {
        $query = Post::with(['user', 'comments.user'])->withCount('likes');

        // Filter by type if provided
        if ($request->has('type') && !empty($request->type)) {
            $query->where('type', $request->type);
        }

        $posts = $query->orderBy('created_at', 'desc')->get()->map(function ($post) use ($request) {
            $user = $request->user('sanctum');
            $post->is_liked = $user ? $post->likes()->where('user_id', $user->id)->exists() : false;
            $post->comments_count = $post->comments()->count();
            return $post;
        });

        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $user = $request->user() ?: \App\Models\User::where('email', $request->email)->first() ?: \App\Models\User::find($request->user_id) ?: \App\Models\User::first();

        $validator = Validator::make($request->all(), [
            'type' => 'required|in:meme,opinion,recommendation,question',
            'content' => 'required|string|min:3|max:5000',
            'image_url' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $post = Post::create([
            'user_id' => $user ? $user->id : 1,
            'type' => $request->type,
            'content' => $request->content,
            'image_url' => $request->image_url,
        ]);

        if ($user) {
            $this->evaluateCommunityBadges($user);
        }

        return response()->json([
            'message' => 'Post created successfully',
            'post' => $post->load('user')
        ], 201);
    }

    public function toggleLike(Request $request, $id)
    {
        $user = $request->user() ?: \App\Models\User::where('email', $request->email)->first() ?: \App\Models\User::find($request->user_id) ?: \App\Models\User::first();
        $post = Post::find($id);

        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        $userId = $user ? $user->id : 1;
        $liked = $post->likes()->toggle($userId);
        $isLiked = count($liked['attached']) > 0;

        return response()->json([
            'message' => $isLiked ? 'Post liked' : 'Post unliked',
            'is_liked' => $isLiked,
            'likes_count' => $post->likes()->count()
        ]);
    }

    public function comment(Request $request, $id)
    {
        $user = $request->user() ?: \App\Models\User::where('email', $request->email)->first() ?: \App\Models\User::find($request->user_id) ?: \App\Models\User::first();
        $post = Post::find($id);

        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'comment' => 'required|string|min:1|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $comment = PostComment::create([
            'post_id' => $post->id,
            'user_id' => $user ? $user->id : 1,
            'comment' => $request->comment,
        ]);

        return response()->json([
            'message' => 'Comment added successfully',
            'comment' => $comment->load('user')
        ], 201);
    }

    public function destroyPost($id)
    {
        $post = Post::findOrFail($id);
        $post->delete();
        return response()->json(['message' => 'Postingan komunitas berhasil dihapus oleh Admin!']);
    }

    public function destroyComment($id)
    {
        $comment = PostComment::findOrFail($id);
        $comment->delete();
        return response()->json(['message' => 'Komentar berhasil dihapus oleh Admin!']);
    }

    private function evaluateCommunityBadges($user)
    {
        // 😂 Meme Lord: Post 50 memes
        $memesCount = $user->posts()->where('type', 'meme')->count();

        if ($memesCount >= 50) {
            $user->badges()->syncWithoutDetaching([5 => ['earned_at' => now()]]);
        }
    }
}
