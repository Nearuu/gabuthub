<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Badge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|string|email|max:100|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'avatar' => 'https://api.dicebear.com/7.x/adventurer/svg?seed=' . urlencode($request->username),
            'bio' => 'Hi there! I am new to GabutHub.',
            'role' => 'user'
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'login' => 'required|string', // can be username or email
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if login is email or username
        $user = User::where('email', $request->login)
                    ->orWhere('username', $request->login)
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        // Load badges, watchlist counts, etc.
        $user->load('badges');
        $user->watchlist_count = $user->watchlist()->count();
        $user->reviews_count = $user->reviews()->count();
        $user->posts_count = $user->posts()->count();

        return response()->json($user);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'bio' => 'nullable|string|max:1000',
            'avatar' => 'nullable|string|url|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->update($request->only('bio', 'avatar'));

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->load('badges')
        ]);
    }

    public function listUsers(Request $request)
    {
        $admin = $request->user();
        if (!$admin || $admin->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin role required.'], 403);
        }

        $users = User::orderBy('id', 'desc')->get();
        return response()->json($users);
    }

    public function updateUserRole(Request $request, $id)
    {
        $admin = $request->user();
        if (!$admin || $admin->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin role required.'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $request->validate([
            'role' => 'required|string|in:admin,user',
        ]);

        // Prevent self-demotion
        if ($admin->id === $user->id) {
            return response()->json(['message' => 'Anda tidak bisa mendemosi diri sendiri.'], 400);
        }

        $user->update(['role' => $request->role]);

        return response()->json([
            'message' => 'Role user berhasil diperbarui',
            'user' => $user
        ]);
    }

    public function deleteUser(Request $request, $id)
    {
        $admin = $request->user();
        if (!$admin || $admin->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin role required.'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Prevent self-deletion
        if ($admin->id === $user->id) {
            return response()->json(['message' => 'Anda tidak bisa menghapus akun sendiri.'], 400);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }

    public function listBadges()
    {
        return response()->json(Badge::all());
    }

    public function storeBadge(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:500',
            'icon' => 'nullable|string|max:255',
        ]);

        $badge = Badge::create($request->only('name', 'description', 'icon'));
        return response()->json(['message' => 'Badge berhasil dibuat!', 'badge' => $badge], 201);
    }

    public function updateBadge(Request $request, $id)
    {
        $badge = Badge::findOrFail($id);
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:500',
            'icon' => 'nullable|string|max:255',
        ]);

        $badge->update($request->only('name', 'description', 'icon'));
        return response()->json(['message' => 'Badge berhasil diperbarui!', 'badge' => $badge]);
    }

    public function destroyBadge($id)
    {
        $badge = Badge::findOrFail($id);
        $badge->delete();
        return response()->json(['message' => 'Badge berhasil dihapus!']);
    }

    public function toggleBanUser($id)
    {
        $user = User::findOrFail($id);
        $user->is_banned = !$user->is_banned;
        $user->save();
        return response()->json([
            'message' => $user->is_banned ? 'User berhasil di-banned/dibekukan!' : 'Akses user berhasil dipulihkan!',
            'is_banned' => $user->is_banned
        ]);
    }
}
