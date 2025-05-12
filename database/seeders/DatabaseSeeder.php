<?php

namespace Database\Seeders;

use App\Models\Consignment;
use App\Models\Expense;
use App\Models\Order;
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
            ->count(15)
            ->create();

        $orders = Order::factory()
            ->count(10)
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
    }
}
