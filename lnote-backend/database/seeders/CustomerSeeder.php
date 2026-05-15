<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            ['name' => 'Ibu Siti', 'phone' => '081234567890', 'phone_number' => '081234567890', 'email' => 'siti@example.com'],
            ['name' => 'Pak Budi', 'phone' => '081298765432', 'phone_number' => '081298765432', 'email' => 'budi@example.com'],
            ['name' => 'Bu Rina', 'phone' => '081377788899', 'phone_number' => '081377788899', 'email' => null],
        ];

        foreach ($customers as $c) {
            Customer::updateOrCreate(['email' => $c['email']], $c);
        }
    }
}
