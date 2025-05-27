<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory, HasUuids;

    protected $appends = [ 'short_id' ];
    protected $fillable = [
      'name',
      'quantity',
      'unit',
      'description',
      'hasVariations',
      'image_url',
      'price'
    ];

    public function productAttributes(): HasMany
    {
        return $this->hasMany(ProductAttribute::class);
    }

    public function productVariants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    protected function shortId(): Attribute
    {
        return Attribute::make(
            get: fn () => Str::of($this->id)->substr(0,8)
        );
    }

    protected function price(): Attribute
    {
        return Attribute::make(
            get: fn($value) => $value/100,
            set: fn($value) => $value*100
        );
    }

    public function suppliers()
    {
        return $this->belongsToMany(Supplier::class);
    }

}
