<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    const UPDATED_AT = null;

    protected $fillable = [
        'username',
        'email',
        'password',
        'avatar',
        'bio',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function tierLists()
    {
        return $this->hasMany(TierList::class);
    }

    public function watchlist()
    {
        return $this->belongsToMany(Content::class, 'watchlists')
                    ->withPivot('id', 'status', 'personal_rating', 'notes')
                    ->withTimestamps();
    }

    public function badges()
    {
        return $this->belongsToMany(Badge::class, 'user_badges', 'user_id', 'badge_id')
                    ->withPivot('earned_at');
    }

    public function postLikes()
    {
        return $this->belongsToMany(Post::class, 'post_likes');
    }

    public function reviewLikes()
    {
        return $this->belongsToMany(Review::class, 'review_likes');
    }

    public function votes()
    {
        return $this->belongsToMany(PollOption::class, 'poll_votes', 'user_id', 'option_id');
    }
}
