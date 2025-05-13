<?php

namespace Database\Factories;

use App\Models\Consignment;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Log;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ConsignmentItem>
 */
class ConsignmentItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => fake()->uuid(),
            'product_id' => Product::factory(),
            'qty' => rand(10, 50),
            'product_variant_id' => fn( array $attr ) => ProductVariant::where('product_id', $attr['product_id'])->first()->id,
        ];
    }
}
