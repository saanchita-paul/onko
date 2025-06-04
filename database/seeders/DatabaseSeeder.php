<?php

namespace Database\Seeders;

use App\Models\Consignment;
use App\Models\Expense;
use App\Models\Employee;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Sequence;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $consignments = Consignment::factory()
            ->count(30)
            ->create();

        $orders = Order::factory()
            ->count(100)
            ->state(new Sequence(
                fn() => ['created_at' => fake()->dateTimeBetween('-6 months', 'now')]
            ))
            ->create();

        $employees = Employee::factory()
            ->count(10)
            ->create();

        Supplier::factory()
            ->count(10)
            ->create();

        Payment::factory()
            ->count(100)
            ->create();

        $rand = rand(10, 20);

        for ($i = 0; $i < $rand; $i++) {
            Expense::factory()->create([
                'expensable_id' => $orders->random()->id,
                'expensable_type' => Order::class,
            ]);

            Expense::factory()->create([
                'expensable_id' => $consignments->random()->id,
                'expensable_type' => Consignment::class,
            ]);

            Expense::factory()->create([
                'expensable_id' => $employees->random()->id,
                'expensable_type' => Employee::class,
            ]);
        }
    }
}
