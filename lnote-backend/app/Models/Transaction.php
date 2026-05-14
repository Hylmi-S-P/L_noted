<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'customer_id', 'service_price_id', 'quantity', 'amount', 'status', 'payment_status', 'due_date', 'notes'
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
}
