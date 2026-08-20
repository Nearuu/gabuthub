<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'content_id',
        'rating',
        'review',
        'spoiler',
    ];

    protected $casts = [
        'spoiler' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function content()
    {
        return $this->belongsTo(Content::class);
    }

    public function likes()
    {
        return $this->belongsToMany(User::class, 'review_likes');
    }
}
