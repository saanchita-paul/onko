<?php

namespace Database\Factories;

use App\Models\ConsignmentItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\DB;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'consignment_item_id' => ConsignmentItem::factory(),
            'unit_price' => 50000,
            'qty' => fake()->numberBetween(0, 6),
            'status' => 'sold',
        ];
    }
}
