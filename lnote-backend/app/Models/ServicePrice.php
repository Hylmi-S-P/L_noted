<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServicePrice extends Model
{
    use HasFactory;

    protected $table = 'service_prices';

    protected $fillable = [
        'name', 'price', 'unit', 'notes'
    ];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
