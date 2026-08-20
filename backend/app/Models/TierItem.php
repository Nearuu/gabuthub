<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TierItem extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'row_id',
        'content_id',
    ];

    public function row()
    {
        return $this->belongsTo(TierRow::class, 'row_id');
    }

    public function content()
    {
        return $this->belongsTo(Content::class);
    }
}
