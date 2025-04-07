<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
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
            'name' => fake()->words(rand(3, 8), true),
            'description' => fake()->sentence(20),
            'price' => fake()->randomNumber(7),

            'image_url' => 'https://api.dicebear.com/9.x/glass/svg?seed=' . Str::of(fake()->words(rand(3, 8), true))->replace(' ', '+')
        ];
    }
}
