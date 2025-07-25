<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Option extends Model
{
    protected $fillable = ['key', 'value'];

    public static function companyDetails()
    {
        $options = Option::whereIn('key', [
            'company_name',
            'company_address',
            'logo',
        ])->pluck('value', 'key');

        return [
            'company_name' => $options['company_name'] ?? null,
            'company_address' => $options['company_address'] ?? null,
            'logo' => $options['logo'] ?? null,
        ];
    }

}
