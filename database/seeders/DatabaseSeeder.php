<?php

namespace Database\Seeders;

use App\Models\Consignment;
use App\Models\Expense;
use App\Models\Employee;
use App\Models\Order;
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

        $rand = rand(1, 15);

        for($i = 0; $i < $rand; $i++)
        {
            $order = $orders->random();
            $consignment = $consignments->random();

            Expense::factory()->create([
                'expensable_id' => $order->id
            ]);

            Expense::factory()->create([
                'expensable_id' => $consignment->id,
                'expensable_type' => Consignment::class,
            ]);
        }

        Employee::factory()
            ->count(10)
            ->create();

        Supplier::factory()
            ->count(100)
            ->create();
    }
}
