<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TierRow extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'tier_list_id',
        'label',
    ];

    public function tierList()
    {
        return $this->belongsTo(TierList::class);
    }

    public function items()
    {
        return $this->hasMany(TierItem::class, 'row_id');
    }
}
