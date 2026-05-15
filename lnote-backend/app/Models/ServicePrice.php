<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServicePrice extends Model
{
    use HasFactory;

    protected $table = 'service_prices';

    protected $fillable = [
        'user_id', 'name', 'service_type', 'price', 'price_per_kg', 'unit', 'notes'
    ];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function getPriceAttribute($value): ?int
    {
        return $value ?? (isset($this->attributes['price_per_kg']) ? (int) $this->attributes['price_per_kg'] : null);
    }

    public function getPricePerKgAttribute($value): ?int
    {
        return $value ?? (isset($this->attributes['price']) ? (int) $this->attributes['price'] : null);
    }
}
