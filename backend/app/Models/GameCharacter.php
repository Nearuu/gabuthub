<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameCharacter extends Model
{
    public $timestamps = false;
    protected $table = 'game_characters';

    protected $fillable = [
        'name',
        'series',
        'description',
        'avatar',
    ];
}
