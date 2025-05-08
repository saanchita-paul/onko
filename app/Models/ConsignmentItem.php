<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsignmentItem extends Model
{
    use HasFactory, HasUuids;
    
    protected $fillable = [
        'product_id',
        'product_variant_id',
        'cost_price',
        'exchange_rate',
        'qty',
        'qty_sold',
        'qty_waste',
    ];

    public function consignment(): BelongsTo
    {
        return $this->belongsTo(Consignment::class);
    }
}
