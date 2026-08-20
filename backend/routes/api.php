<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\WatchlistController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\CommunityController;
use App\Http\Controllers\Api\TierListController;
use App\Http\Controllers\Api\PollController;
use App\Http\Controllers\Api\OstController;

Route::get('/test-db', function () {
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        $tables = \Illuminate\Support\Facades\DB::select('SHOW TABLES');
        $usersCount = \App\Models\User::count();
        return response()->json([
            'status' => 'connected',
            'database' => \Illuminate\Support\Facades\DB::connection()->getDatabaseName(),
            'tables_count' => count($tables),
            'users_count' => $usersCount
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/contents', [ContentController::class, 'index']);
Route::get('/contents/surprise', [ContentController::class, 'surprise']);
Route::get('/contents/{id}', [ContentController::class, 'show']);
Route::get('/genres', [ContentController::class, 'getGenres']);

Route::get('/posts', [CommunityController::class, 'index']);
Route::get('/tier-lists', [TierListController::class, 'index']);
Route::get('/polls', [PollController::class, 'index']);
Route::get('/hot-takes', [PollController::class, 'listHotTakes']);
Route::get('/flag-characters', [PollController::class, 'listFlagCharacters']);
Route::get('/games/guess-ost', [OstController::class, 'getGuessOstGame']);
Route::get('/admin/users', [AuthController::class, 'listUsers']);
Route::post('/admin/users', [AuthController::class, 'storeUser']);
Route::put('/admin/users/{id}/role', [AuthController::class, 'updateUserRole']);
Route::delete('/admin/users/{id}', [AuthController::class, 'deleteUser']);
Route::post('/admin/users/{id}/ban', [AuthController::class, 'toggleBanUser']);

// Public Admin & Content CRUD Management Routes
Route::post('/contents', [ContentController::class, 'store']);
Route::put('/contents/{id}', [ContentController::class, 'update']);
Route::post('/contents/{id}', [ContentController::class, 'update']);
Route::delete('/contents/{id}', [ContentController::class, 'destroy']);
Route::post('/contents/{id}/featured', [ContentController::class, 'setFeatured']);
Route::post('/contents/{contentId}/osts', [ContentController::class, 'storeOst']);
Route::post('/admin/clear-all-osts', function() {
    \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
    \App\Models\Ost::truncate();
    \Illuminate\Support\Facades\DB::table('ost_likes')->truncate();
    \Illuminate\Support\Facades\DB::table('ost_votes')->truncate();
    \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();
    return response()->json(['message' => 'Semua data OST berhasil dihapus 100%!']);
});
Route::put('/osts/{id}', [OstController::class, 'updateOst']);
Route::delete('/osts/{id}', [OstController::class, 'destroyOst']);

// Admin Polls/Voting Management
Route::post('/polls', [PollController::class, 'store']);
Route::delete('/polls/{id}', [PollController::class, 'destroy']);

// Admin Game Prompts & Settings Management
Route::post('/hot-takes', [PollController::class, 'storeHotTake']);
Route::put('/hot-takes/{id}', [PollController::class, 'updateHotTake']);
Route::delete('/hot-takes/{id}', [PollController::class, 'destroyHotTake']);

Route::post('/flag-characters', [PollController::class, 'storeFlagCharacter']);
Route::put('/flag-characters/{id}', [PollController::class, 'updateFlagCharacter']);
Route::delete('/flag-characters/{id}', [PollController::class, 'destroyFlagCharacter']);

Route::post('/admin/games/settings', [OstController::class, 'saveGameSettings']);

// Admin Delete Community Posts & Tier Lists
Route::delete('/admin/posts/{id}', [CommunityController::class, 'destroyPost']);
Route::delete('/admin/tier-lists/{id}', [TierListController::class, 'destroyTierList']);

// Admin Badges Management
Route::get('/admin/badges', [AuthController::class, 'listBadges']);
Route::post('/admin/badges', [AuthController::class, 'storeBadge']);
Route::put('/admin/badges/{id}', [AuthController::class, 'updateBadge']);
Route::delete('/admin/badges/{id}', [AuthController::class, 'destroyBadge']);

// Admin Reviews Management
Route::get('/admin/reviews', [ReviewController::class, 'listReviews']);
Route::delete('/admin/reviews/{id}', [ReviewController::class, 'destroyReview']);

// Super Admin Extended Features
Route::get('/admin/stats', [ContentController::class, 'getAdminStats']);
Route::post('/admin/genres', [ContentController::class, 'storeGenre']);
Route::delete('/admin/genres/{id}', [ContentController::class, 'destroyGenre']);
Route::delete('/admin/comments/{id}', [CommunityController::class, 'destroyComment']);

// Watchlist
Route::get('/watchlist', [WatchlistController::class, 'index']);
Route::post('/watchlist', [WatchlistController::class, 'store']);
Route::delete('/watchlist/{contentId}', [WatchlistController::class, 'destroy']);

// Reviews
Route::post('/contents/{contentId}/reviews', [ReviewController::class, 'store']);
Route::post('/reviews/{id}/like', [ReviewController::class, 'toggleLike']);

// Community (Posts)
Route::post('/posts', [CommunityController::class, 'store']);
Route::delete('/posts/{id}', [CommunityController::class, 'destroyPost']);
Route::post('/posts/{id}/like', [CommunityController::class, 'toggleLike']);
Route::post('/posts/{id}/comments', [CommunityController::class, 'comment']);

// Tier Lists
Route::post('/tier-lists', [TierListController::class, 'store']);
Route::post('/tier-lists/{id}/like', [TierListController::class, 'toggleLike']);

// Polls
Route::post('/polls/{id}/vote', [PollController::class, 'vote']);

// OSTs
Route::post('/osts/{id}/like', [OstController::class, 'toggleLike']);
Route::post('/osts/{id}/vote', [OstController::class, 'toggleVote']);

// User Profile Update
Route::post('/user/profile', [AuthController::class, 'updateProfile']);
Route::put('/user/profile', [AuthController::class, 'updateProfile']);
Route::get('/user', [AuthController::class, 'me']);
Route::post('/logout', [AuthController::class, 'logout']);

// Protected routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Auth profile
    Route::get('/sanctum/user', [AuthController::class, 'me']);
});
