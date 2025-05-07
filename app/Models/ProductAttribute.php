<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductAttribute extends Model
{
    use HasFactory, HasUuids;

    protected $fillable= ['name, num_options'];


    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
    