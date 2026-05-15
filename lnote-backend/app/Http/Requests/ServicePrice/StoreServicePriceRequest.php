<?php

namespace App\Http\Requests\ServicePrice;

use Illuminate\Foundation\Http\FormRequest;

class StoreServicePriceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'max:255'],
            'service_type' => ['required', 'string', 'max:100'],
            'price' => ['nullable', 'integer', 'min:0'],
            'price_per_kg' => ['nullable', 'integer', 'min:0'],
            'unit' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
