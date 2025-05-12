<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Expense extends Model
{
    use HasUuids, HasFactory;

    public function expensable(): MorphTo
    {
        return $this->morphTo();
    }
}
