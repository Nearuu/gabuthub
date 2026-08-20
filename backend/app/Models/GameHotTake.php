<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameHotTake extends Model
{
    public $timestamps = false;
    protected $table = 'game_hot_takes';

    protected $fillable = [
        'text',
        'category',
    ];
}
