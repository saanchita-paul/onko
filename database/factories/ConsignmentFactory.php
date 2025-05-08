<?php

namespace Database\Factories;

use App\Models\Consignment;
use App\Models\ConsignmentItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Consignment>
 */
class ConsignmentFactory extends Factory
{
    public function configure()
    {
        return $this->afterCreating(function(Consignment $consignment) {
            ConsignmentItem::factory()->count(rand(5,10))->create([
                'consignment_id' => $consignment->id,
            ]);           
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
            'lc_num' => fake()->lexify('?????????'),
            'value' => intval(fake()->numerify('######00')),
            'currency' => 'BDT',
            'exchange_rate' => 100
        ];
    }
}
