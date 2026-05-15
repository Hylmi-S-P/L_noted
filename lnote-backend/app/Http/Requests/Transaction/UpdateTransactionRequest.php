<?php

namespace App\Http\Requests\Transaction;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['nullable', 'string', 'in:pending,proses,selesai,diambil,process,done,taken'],
            'payment_status' => ['nullable', 'in:belum_lunas,lunas,paid,unpaid,0,1,true,false'],
            'notes' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
        ];
    }
}
