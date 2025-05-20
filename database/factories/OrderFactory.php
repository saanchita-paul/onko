<?php

namespace Database\Factories;

use App\Models\Consignment;
use App\Models\ConsignmentItem;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\DB;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    public function configure()
    {
        return $this->afterCreating(function (Order $order) {
            
            $count = rand(1, 5);
            $items = collect([]);
            
            for ($i = 0; $i < $count; $i++) {
                DB::transaction(function () use ($order, &$items) {
                    $availableItems = ConsignmentItem::whereColumn('qty', '>', 'qty_sold')->get();

                    if ($availableItems->isEmpty()) {
                        Consignment::factory()->create();
                        $availableItems = ConsignmentItem::whereColumn('qty', '>', 'qty_sold')->get();
                    }

                    $consignmentItem = $availableItems->random();
                    $maxQty = $consignmentItem->qty - $consignmentItem->qty_sold;
                    
                    $randQty = rand(1, $maxQty);

                    $item = OrderItem::factory()->create([
                        'order_id' => $order->id,
                        'consignment_item_id' => $consignmentItem->id,
                        'qty' => $randQty,
                    ]);

                    $items->push($item);

                    $consignmentItem->refresh();
                    $consignmentItem->qty_sold = $consignmentItem->qty_sold + $randQty;
                    $consignmentItem->save();
                });

                $order->sub_total = $items->reduce(fn($carry, $item) => $carry + ($item->qty * $item->unit_price), 0);
                $order->sub_total = $items->reduce(fn($carry, $item) => $carry + ($item->qty * $item->unit_price), 0);
                $order->discount_total = $order->sub_total / 20;
                $order->tax_total = $order->sub_total / 10;
                $order->grand_total = $order->sub_total - $order->discount_total + $order->tax_total;
                $order->payments_total = $order->grand_total;
                $order->status = 'paid';

                $order->save();
            }
        });
    }

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'sub_total' => fake()->numberBetween(1000, 1000000),
            'discount_total' => fn(array $attr) => fake()->numberBetween(0, $attr['sub_total'] / 10),
            'tax_total' => fn(array $attr) => fake()->numberBetween(0, $attr['sub_total'] / 10),
            'grand_total' => fn(array $attr) =>
                $attr['sub_total'] - $attr['discount_total'] + $attr['tax_total'],
            'payments_total' => fn(array $attr) =>
            fake()->randomElement([
                $attr['grand_total'],
                fake()->numberBetween($attr['grand_total'] / 10, $attr['grand_total']),
            ]),
            'status' => fn(array $attr) =>
            $attr['payments_total'] === $attr['grand_total'] ? 'paid' : 'balance-remaining',
        ];
    }
}
