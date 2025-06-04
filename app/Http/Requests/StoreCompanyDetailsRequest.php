<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCompanyDetailsRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_name' => 'nullable|string',
            'company_address' => 'nullable|string',
            'logo' => 'nullable|image|max:2048',
        ];
    }
}
