<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Expense extends Model
{
    public function expensable(): MorphTo
    {
        return $this->morphTo();
    }
}
