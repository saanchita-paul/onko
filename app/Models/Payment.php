<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'order_id',
        'payment_amount',
        'payment_type',
        'status'
    ];

    protected $casts = [
        'payment_amount' => 'integer',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

}
