<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        $order = Order::with('payments')->get()->first(function ($order) {
            return $order->payments->sum('payment_amount') < $order->grand_total;
        });

        if (!$order) {
            $order = Order::factory()->create();
        }

        $paidAmount = $order->payments->sum('payment_amount');
        $remainingAmount = $order->grand_total - $paidAmount;

        return [
            'order_id' => $order->id,
            'payment_amount' => $remainingAmount,
            'payment_type' => $this->faker->randomElement(['cash', 'credit_card', 'bank_transfer']),
            'status' => 'paid',
        ];
    }
}
