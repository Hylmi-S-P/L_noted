<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'customer_id',
        'service_price_id',
        'quantity',
        'weight_kg',
        'service_type',
        'price_per_kg',
        'amount',
        'total_price',
        'receipt_image_path',
        'ocr_raw_text',
        'status',
        'payment_status',
        'due_date',
        'notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function servicePrice()
    {
        return $this->belongsTo(ServicePrice::class);
    }

    public function getAmountAttribute($value): ?int
    {
        return $value ?? (isset($this->attributes['total_price']) ? (int) $this->attributes['total_price'] : null);
    }

    public function getTotalPriceAttribute($value): ?int
    {
        return $value ?? (isset($this->attributes['amount']) ? (int) $this->attributes['amount'] : null);
    }
}
