<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Content extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'title',
        'type',
        'synopsis',
        'poster_url',
        'banner_url',
        'banner_position',
        'release_date',
        'is_featured',
    ];

    public function genres()
    {
        return $this->belongsToMany(Genre::class, 'content_genres');
    }

    public function osts()
    {
        return $this->hasMany(Ost::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'watchlists')
                    ->withPivot('id', 'status', 'personal_rating', 'notes')
                    ->withTimestamps();
    }
}
