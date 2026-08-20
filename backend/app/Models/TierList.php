<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TierList extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'title',
        'category',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function rows()
    {
        return $this->hasMany(TierRow::class);
    }

    public function likes()
    {
        return $this->belongsToMany(User::class, 'tier_list_likes');
    }
}
