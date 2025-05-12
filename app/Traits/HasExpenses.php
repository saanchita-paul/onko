<?php

namespace App\Traits;

use App\Models\Expense;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasExpenses {

    public function expenses(): MorphMany
    {
        return $this->morphMany(Expense::class, 'expensable');
    }
}