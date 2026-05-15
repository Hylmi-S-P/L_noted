<?php

namespace App\Http\Requests\Transaction;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('weight_kg')) {
            $this->merge([
                'weight_kg' => str_replace(',', '.', (string) $this->input('weight_kg')),
            ]);
        }

        if ($this->has('manual_total_price')) {
            $this->merge([
                'manual_total_price' => str_replace(['.', ','], '', (string) $this->input('manual_total_price')),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'service_price_id' => ['required', 'integer', 'exists:service_prices,id'],
            'weight_kg' => ['required', 'numeric', 'min:0.01', 'max:999.99'],
            'manual_total_price' => ['nullable', 'integer', 'min:0'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            'notes' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
        ];
    }
}
