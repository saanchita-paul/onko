<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductAttribute extends Model
{
    use HasFactory, HasUuids;

    protected $fillable= ['name', 'options'];

    protected $casts = [
        'options' => 'array'
    ];


    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
    