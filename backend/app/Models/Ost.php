<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ost extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'content_id',
        'title',
        'artist',
        'preview_url',
    ];

    public function content()
    {
        return $this->belongsTo(Content::class);
    }

    public function likes()
    {
        return $this->belongsToMany(User::class, 'ost_likes');
    }

    public function votes()
    {
        return $this->belongsToMany(User::class, 'ost_votes');
    }
}
