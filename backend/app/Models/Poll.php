<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Poll extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'title',
        'description',
        'ends_at',
    ];

    protected $casts = [
        'ends_at' => 'datetime',
    ];

    public function options()
    {
        return $this->hasMany(PollOption::class);
    }
}
