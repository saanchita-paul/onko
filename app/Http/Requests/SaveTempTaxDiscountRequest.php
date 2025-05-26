<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveTempTaxDiscountRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tax' => 'nullable|numeric',
            'tax_type' => 'nullable|in:fixed,percentage',
            'tax_description' => 'nullable|string',
            'discount' => 'nullable|numeric',
            'discount_type' => 'nullable|in:fixed,percentage',
            'discount_description' => 'nullable|string',
        ];
    }
}
