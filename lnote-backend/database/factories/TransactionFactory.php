<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\ServicePrice;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        $price = fake()->numberBetween(5000, 20000);
        $quantity = fake()->numberBetween(1, 8);

        return [
            'user_id' => User::factory(),
            'customer_id' => Customer::factory(),
            'service_price_id' => ServicePrice::factory()->state(['price' => $price]),
            'quantity' => $quantity,
            'amount' => $price * $quantity,
            'status' => 'proses',
            'payment_status' => 'belum_lunas',
            'due_date' => fake()->optional()->date(),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
