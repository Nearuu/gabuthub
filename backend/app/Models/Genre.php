<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Genre extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'name',
    ];

    public function contents()
    {
        return $this->belongsToMany(Content::class, 'content_genres');
    }
}
