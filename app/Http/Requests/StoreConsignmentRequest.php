<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConsignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => ['nullable', 'unique:consignments,id'],
            'lc_num' => ['nullable', 'unique:consignments,lc_num'],
            'value' => ['required', 'numeric'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product' => ['required', 'string'],
            'items.*.variant' => ['required', 'string'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.*.product.required' => 'The product field in item :position is required.',
            'items.*.variant.required' => 'The variant field in item :position is required.',
            'items.*.quantity.required' => 'The quantity field in item :position is required.',
            'items.*.quantity.integer' => 'The quantity field in item :position must be a number.',
            'items.*.quantity.min' => 'The quantity field in item :position must be at least 1.',
            'items.*.price.required' => 'The price field in item :position is required.',
            'items.*.price.numeric' => 'The price field in item :position must be a number.',
            'items.*.price.min' => 'The price field in item :position must be at least 0.',
        ];
    }


    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $messages = $validator->messages();

            $updated = [];
            foreach ($messages->getMessages() as $key => $messageList) {
                if (preg_match('/items\.(\d+)\./', $key, $matches)) {
                    $index = (int)$matches[1] + 1;
                    foreach ($messageList as $message) {
                        $updated[$key][] = str_replace(':position', $index, $message);
                    }
                }
            }
            $validator->messages()->merge($updated);

            $items = $this->input('items', []);
            $calculatedTotal = collect($items)->sum(function ($item) {
                $quantity = (float) ($item['quantity'] ?? 0);
                $price = (float) ($item['price'] ?? 0);
                return $quantity * $price;
            });

            $value = (float) $this->input('value');
            if ($value !== $calculatedTotal) {
                $validator->errors()->add('value', 'The value must equal the sum of quantity × price for all items.');
            }
        });
    }
}
