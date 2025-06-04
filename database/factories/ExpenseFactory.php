<?php

namespace Database\Factories;

use App\Models\Expense;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ExpenseFactory extends Factory
{
    protected $model = Expense::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'description' => $this->faker->sentence(3),
            'amount' => fake()->numberBetween(1000, 100000),
            'expense_date' => $this->faker->date(),
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
            'expensable_id' => Order::factory(),
            'expensable_type' => Order::class,
        ];
    }
}
