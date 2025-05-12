<?php

namespace Database\Factories;

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
        return $this->afterCreating(function(Order $order) {

            $count = rand(1, 5);

            for ($i=0; $i<$count; $i++) {
                DB::transaction(function() use ($order) {
                    $consignment_item = ConsignmentItem::where('qty', '>', 'qty_sold')->get()->random();
                    $rand = rand(1, $consignment_item->qty - $consignment_item->qty_sold);
                    OrderItem::factory()
                        ->create([
                            'order_id' => $order->id,
                            'consignment_item_id' => $consignment_item->id,
                            'qty' => function( array $attr ) use ($rand) {
                                //$consignment->refresh();
                                return $rand;
                            }
                        ]);

                    $consignment_item->refresh();
                    $consignment_item->qty_sold = $consignment_item->qty_sold + $rand;
                    $consignment_item->save();
                    
                }); 
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
            'discount_total' => fn( array $attr ) => fake()-> numberBetween(0, $attr['sub_total'] / 10),
            'tax_total' => fn( array $attr ) => fake()-> numberBetween(0, $attr['sub_total'] / 10),
            'grand_total' => fn( array $attr ) => $attr['sub_total'] - $attr['discount_total'] + $attr['tax_total'],
            'payments_total' => fn( array $attr ) => fake()->randomElement([ $attr['grand_total'], fake()->numberBetween($attr['grand_total']/10, $attr['grand_total'])]),
            'status' => fn( array $attr ) => $attr['payments_total'] === $attr['grand_total'] ? 'paid' : 'balance-remaining',
        ];
    }
}
