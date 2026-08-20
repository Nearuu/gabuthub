<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PollOption extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'poll_id',
        'option_text',
    ];

    public function poll()
    {
        return $this->belongsTo(Poll::class);
    }

    public function votes()
    {
        return $this->belongsToMany(User::class, 'poll_votes', 'option_id', 'user_id');
    }
}
