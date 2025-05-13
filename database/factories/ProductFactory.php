<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    public function configure()
    {
        return $this->afterCreating(function(Product $product) {
            $attributes = ProductAttribute::factory()->count(3)->create([
                'product_id' => $product->id,
            ]);

            $headers = $attributes->map(fn($attr) => $attr->name);
            $options = $attributes->map(fn($attr) => collect($attr->options));

            $joined = $options->first();

            $options->each(function($op, $key) use (&$joined) {
                if ($key > 0) {
                    $joined = $joined->crossJoin($op);
                }
            });

            $joined = $joined->map(fn($j) => collect($j)->flatten());
            $combined = $joined->map(fn ($v)  => $headers->combine($v));
            
            $combined->map(function($c) use ($product) {
                ProductVariant::factory()->create([
                    'product_id' => $product->id,
                    'options' => $c,
                ]);
            });
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
            'id' => fake()->uuid(),
            'name' => fake()->words(rand(3, 8), true),
            'description' => fake()->sentence(20),
            'price' => fake()->randomNumber(7),

            'image_url' => 'https://api.dicebear.com/9.x/glass/svg?seed=' . Str::of(fake()->words(rand(3, 8), true))->replace(' ', '+')
        ];
    }
}
