<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
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
        $rules = [
            'product_name' => 'required|string|max:255',
            'product_description' => 'required|string|max:255',
            'has_variations' => 'required|boolean',
        ];

        if ($this->input('has_variations')) {
            $rules['variants'] = 'required|array|min:1';
            $rules['variants.*.name'] = 'required|string|max:255';
            $rules['variants.*.options'] = 'required|array|min:1';
            $rules['variants.*.options.*'] = 'required|string|max:255';
            $rules['combinations'] = 'required|array|min:1';
        }
        return $rules;
    }

}
