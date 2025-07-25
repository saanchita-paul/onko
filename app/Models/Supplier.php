<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    /** @use HasFactory<\Database\Factories\SupplierFactory> */
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'address',
        'phone',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class,'product_suppliers');
    }

}
