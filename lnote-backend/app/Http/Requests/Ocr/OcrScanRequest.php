<?php

namespace App\Http\Requests\Ocr;

use Illuminate\Foundation\Http\FormRequest;

class OcrScanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'receipt_image' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
        ];
    }
}
