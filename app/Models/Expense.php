<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Str;

class Expense extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'id',
        'description',
        'amount',
        'expensable_id',
        'expensable_type',
        'expense_date',
        'status',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    public function expensable(): MorphTo
    {
        return $this->morphTo();
    }
}
