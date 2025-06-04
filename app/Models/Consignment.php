<?php

namespace App\Models;

use App\Traits\HasExpenses;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Consignment extends Model
{
    use HasFactory, HasUuids, HasExpenses;

    protected $fillable = ['lc_num', 'value', 'currency', 'exchange_rate'];


    public function consignmentItems(): HasMany
    {
        return $this->hasMany(ConsignmentItem::class);
    }

    public function expenses(): MorphMany
    {
        return $this->morphMany(Expense::class, 'expensable');
    }

}
