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
//            'key' => 'required|string|in:company_name,company_address,invoice_date,logo',
//            'value' => 'required|string|in:company_name,company_address,invoice_date,logo',
            'company_name' => 'nullable|string',
            'company_address' => 'nullable|string',
            'invoice_date' => 'nullable|date',
            'logo' => 'nullable|image|max:2048',
        ];
    }
}
