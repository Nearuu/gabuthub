<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Content;
use App\Models\Genre;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    public function index(Request $request)
    {
        $query = Content::query();

        // Filter by search query (title)
        if ($request->has('search') && !empty($request->search)) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Filter by content type (film [movie+series], drakor [drakor+drama], anime, movie, series)
        if ($request->has('type') && !empty($request->type)) {
            $type = strtolower($request->type);
            if ($type === 'film') {
                $query->whereIn('type', ['movie', 'film', 'series', 'mcu']);
            } elseif ($type === 'drakor' || $type === 'drama') {
                $query->whereIn('type', ['drakor', 'drama', 'variety', 'series']);
            } else {
                $query->where('type', $type);
            }
        }

        // Filter by genre ID
        if ($request->has('genre_id') && !empty($request->genre_id)) {
            $query->whereHas('genres', function ($q) use ($request) {
                $q->where('genres.id', $request->genre_id);
            });
        }

        // Load genres, osts, & reviews with user, order alphabetically A-Z
        $query->with(['genres', 'osts', 'reviews.user'])->orderBy('title', 'asc');

        // Execute and paginate/get
        $contents = $query->get()->map(function ($content) {
            // Calculate average rating
            $content->avg_rating = round($content->reviews()->avg('rating'), 1) ?: 0;
            $content->reviews_count = $content->reviews()->count();
            return $content;
        });

        return response()->json($contents);
    }

    public function getGenres()
    {
        return response()->json(Genre::all());
    }

    public function uploadFile(Request $request)
    {
        $request->validate([
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,svg|max:10240',
            'file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,svg|max:10240',
        ]);

        $file = $request->file('image') ?: $request->file('file');

        if (!$file) {
            return response()->json(['message' => 'No image file uploaded'], 400);
        }

        $path = $file->store('uploads', 'public');
        $url = asset('storage/' . $path);

        return response()->json([
            'message' => 'Image uploaded successfully',
            'url' => $url,
            'path' => $path
        ]);
    }

    public function show(Request $request, $id)
    {
        $content = Content::with(['genres', 'osts'])->find($id);

        if (!$content) {
            return response()->json(['message' => 'Content not found'], 404);
        }

        // Fetch reviews with users
        $content->reviews = $content->reviews()
            ->with('user')
            ->withCount('likes')
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate average rating
        $content->avg_rating = round($content->reviews()->avg('rating'), 1) ?: 0;

        // Check if user has liked reviews or has watchlisted this content
        $user = $request->user('sanctum');
        if ($user) {
            // Attach watchlist pivot data if present
            $watchlist = $user->watchlist()->where('content_id', $content->id)->first();
            $content->watchlist_status = $watchlist ? $watchlist->pivot->status : null;
            $content->personal_rating = $watchlist ? $watchlist->pivot->personal_rating : null;
            $content->personal_notes = $watchlist ? $watchlist->pivot->notes : null;

            // Flag liked reviews
            foreach ($content->reviews as $review) {
                $review->is_liked = $review->likes()->where('user_id', $user->id)->exists();
            }

            // Flag liked & voted OSTs
            foreach ($content->osts as $ost) {
                $ost->is_liked = $ost->likes()->where('user_id', $user->id)->exists();
                $ost->is_voted = $ost->votes()->where('user_id', $user->id)->exists();
            }
        } else {
            $content->watchlist_status = null;
            $content->personal_rating = null;
            $content->personal_notes = null;

            foreach ($content->reviews as $review) {
                $review->is_liked = false;
            }

            foreach ($content->osts as $ost) {
                $ost->is_liked = false;
                $ost->is_voted = false;
            }
        }

        // Load like & vote counts on OSTs
        foreach ($content->osts as $ost) {
            $ost->likes_count = $ost->likes()->count();
            $ost->votes_count = $ost->votes()->count();
        }

        return response()->json($content);
    }

    public function surprise(Request $request)
    {
        // Get a random content item
        $content = Content::inRandomOrder()->first();

        if (!$content) {
            return response()->json(['message' => 'No content available'], 404);
        }

        $content->avg_rating = round($content->reviews()->avg('rating'), 1) ?: 0;

        return response()->json($content);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255|unique:contents,title',
            'type' => 'required|string|in:movie,film,series,drakor,drama,variety,anime,donghua,mcu',
            'synopsis' => 'required|string',
            'poster_url' => 'required|string',
            'banner_url' => 'nullable|string',
            'banner_position' => 'nullable|string',
            'release_date' => 'required|date',
            'genre_ids' => 'nullable|array',
            'genre_ids.*' => 'integer|exists:genres,id',
        ]);

        $content = Content::create([
            'title' => $request->title,
            'type' => $request->type,
            'synopsis' => $request->synopsis,
            'poster_url' => $request->poster_url,
            'banner_url' => $request->banner_url,
            'banner_position' => $request->banner_position ?: 'center top',
            'release_date' => $request->release_date,
        ]);

        if ($request->has('genre_ids') && is_array($request->genre_ids)) {
            $content->genres()->attach($request->genre_ids);
        }

        return response()->json([
            'message' => 'Content created successfully',
            'content' => $content
        ], 201);
    }

    public function storeOst(Request $request, $contentId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'artist' => 'required|string|max:255',
            'preview_url' => 'nullable|string',
        ]);

        $content = Content::find($contentId);
        if (!$content) {
            return response()->json(['message' => 'Content not found'], 404);
        }

        $ost = $content->osts()->create([
            'title' => $request->title,
            'artist' => $request->artist,
            'preview_url' => $request->preview_url ?: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        ]);

        return response()->json([
            'message' => 'OST added successfully',
            'ost' => $ost
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $content = Content::find($id);
        if (!$content) {
            return response()->json(['message' => 'Content not found'], 404);
        }

        $request->validate([
            'title' => 'required|string|max:255|unique:contents,title,' . $id,
            'type' => 'required|string|in:movie,film,series,drakor,drama,variety,anime,donghua,mcu',
            'synopsis' => 'required|string',
            'poster_url' => 'required|string',
            'banner_url' => 'nullable|string',
            'banner_position' => 'nullable|string',
            'release_date' => 'required|date',
            'genre_ids' => 'nullable|array',
            'genre_ids.*' => 'integer|exists:genres,id',
        ]);

        $content->update([
            'title' => $request->title,
            'type' => $request->type,
            'synopsis' => $request->synopsis,
            'poster_url' => $request->poster_url,
            'banner_url' => $request->banner_url,
            'banner_position' => $request->banner_position ?: 'center top',
            'release_date' => $request->release_date,
        ]);

        if ($request->has('genre_ids') && is_array($request->genre_ids)) {
            $content->genres()->sync($request->genre_ids);
        }

        return response()->json([
            'message' => 'Content updated successfully',
            'content' => $content
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $content = Content::find($id);
        if (!$content) {
            return response()->json(['message' => 'Content not found'], 404);
        }

        $content->delete();

        return response()->json([
            'message' => 'Content deleted successfully'
        ]);
    }

    public function setFeatured(Request $request, $id)
    {
        $content = Content::find($id);
        if (!$content) {
            return response()->json(['message' => 'Content not found'], 404);
        }

        // Reset all other contents to is_featured = false
        Content::query()->update(['is_featured' => false]);

        // Set selected content to is_featured = true
        $content->update(['is_featured' => true]);

        return response()->json([
            'message' => 'Content successfully set as Hero Banner!',
            'content' => $content
        ]);
    }

    public function getAdminStats()
    {
        return response()->json([
            'total_contents' => \App\Models\Content::count(),
            'total_drakors' => \App\Models\Content::whereIn('type', ['drakor', 'drama'])->count(),
            'total_users' => \App\Models\User::count(),
            'total_reviews' => \App\Models\Review::count(),
            'total_posts' => \App\Models\Post::count(),
            'total_tier_lists' => \App\Models\TierList::count(),
            'total_osts' => \App\Models\Ost::count(),
        ]);
    }

    public function storeGenre(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255|unique:genres,name']);
        $genre = \App\Models\Genre::create(['name' => $request->name]);
        return response()->json(['message' => 'Genre baru berhasil dibuat!', 'genre' => $genre], 201);
    }

    public function destroyGenre($id)
    {
        $genre = \App\Models\Genre::findOrFail($id);
        $genre->delete();
        return response()->json(['message' => 'Genre berhasil dihapus!']);
    }
}
