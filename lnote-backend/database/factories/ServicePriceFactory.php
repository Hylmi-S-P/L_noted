<?php

namespace Database\Factories;

use App\Models\ServicePrice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServicePrice>
 */
class ServicePriceFactory extends Factory
{
    protected $model = ServicePrice::class;

    public function definition(): array
    {
        return [
            'name' => 'Service '.fake()->word(),
            'price' => fake()->numberBetween(5000, 25000),
            'unit' => 'kg',
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
