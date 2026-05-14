<?php

namespace Database\Seeders;

use App\Models\ServicePrice;
use Illuminate\Database\Seeder;

class ServicePriceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['name' => 'Cuci + Kering (per kg)', 'price' => 8000, 'unit' => 'kg'],
            ['name' => 'Cuci + Setrika (per kg)', 'price' => 10000, 'unit' => 'kg'],
            ['name' => 'Satuan: Bedcover', 'price' => 20000, 'unit' => 'unit'],
        ];

        foreach ($services as $s) {
            ServicePrice::create($s);
        }
    }
}
