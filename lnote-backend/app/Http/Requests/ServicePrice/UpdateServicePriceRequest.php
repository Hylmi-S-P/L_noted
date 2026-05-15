<?php

namespace App\Http\Requests\ServicePrice;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServicePriceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'service_type' => ['sometimes', 'required', 'string', 'max:100'],
            'price' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'price_per_kg' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'unit' => ['sometimes', 'nullable', 'string', 'max:50'],
            'notes' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
