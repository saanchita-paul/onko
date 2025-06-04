<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Employee extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'position',
        'hired_on',
        'meta',
    ];

    public function expenses(): MorphMany
    {
        return $this->morphMany(Expense::class, 'expensable');
    }
}
