<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveCustomerDetailsRequest extends FormRequest
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
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|regex:/^[0-9]+$/|max:20',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if (
                !$this->filled('name') &&
                !$this->filled('email') &&
                !$this->filled('phone')
            ) {
                $validator->errors()->add('form', 'At least one field must be filled out.');
            }
        });
    }
    public function messages(): array
    {
        return [
            'phone.regex' => 'The phone number must contain digits only.',
        ];
    }


}
