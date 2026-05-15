<?php

namespace Database\Seeders;

use App\Models\ServicePrice;
use Illuminate\Database\Seeder;

class ServicePriceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['name' => 'Cuci + Kering (per kg)', 'service_type' => 'wash_dry', 'price' => 8000, 'price_per_kg' => 8000, 'unit' => 'kg'],
            ['name' => 'Cuci + Setrika (per kg)', 'service_type' => 'wash_iron', 'price' => 10000, 'price_per_kg' => 10000, 'unit' => 'kg'],
            ['name' => 'Satuan: Bedcover', 'service_type' => 'bedcover', 'price' => 20000, 'unit' => 'unit'],
        ];

        foreach ($services as $s) {
            ServicePrice::updateOrCreate(['name' => $s['name']], $s);
        }
    }
}
