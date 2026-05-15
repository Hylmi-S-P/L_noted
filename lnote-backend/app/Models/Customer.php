<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'name', 'phone', 'phone_number', 'email', 'address'
    ];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function getPhoneAttribute($value): ?string
    {
        return $value ?? $this->attributes['phone_number'] ?? null;
    }

    public function getPhoneNumberAttribute($value): ?string
    {
        return $value ?? $this->attributes['phone'] ?? null;
    }
}
