<?php

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class ProductControllerUnitTest extends TestCase
{
    use RefreshDatabase;


    /** @test */
    public function it_creates_a_product_with_variants_and_combinations()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $payload = [
            'product_name' => 'T-Shirt',
            'product_description' => 'A comfortable cotton T-Shirt',
            'has_variations' => true,
            'variants' => [
                [
                    'name' => 'Size',
                    'options' => ['S', 'M', 'L']
                ],
                [
                    'name' => 'Color',
                    'options' => ['Red', 'Blue']
                ],
            ],
            'combinations' => [
                ['Size' => 'S', 'Color' => 'Red'],
                ['Size' => 'M', 'Color' => 'Blue'],
                ['Size' => 'S', 'Color' => 'Blue'],
                ['Size' => 'M', 'Color' => 'Red'],
            ],
        ];

        $response = $this->post(route('products.store'), $payload);

        $response->assertRedirect(route('products.index'));

        $product = Product::where('name', 'T-Shirt')->first();
        $this->assertNotNull($product);
        $this->assertEquals('A comfortable cotton T-Shirt', $product->description);

        $this->assertEquals(2, $product->productAttributes()->count());
        $this->assertEquals(4, $product->productVariants()->count());
    }



    /** @test */
    public function it_handles_product_save_failure_due_to_missing_name()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $payload = [
            'product_name' => '',
            'product_description' => 'Missing name test',
            'has_variations' => false,
            'variants' => [],
            'combinations' => [],
        ];

        $response = $this->post(route('products.store'), $payload);

        $response->assertRedirect()
            ->assertSessionHasErrors(['product_name']);
    }

    /** @test */
    public function it_handles_product_save_failure_due_to_missing_product_description()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $payload = [
            'product_name' => 'Missing name test',
            'product_description' => '',
            'has_variations' => false,
            'variants' => [],
            'combinations' => [],
        ];

        $response = $this->post(route('products.store'), $payload);

        $response->assertRedirect()
            ->assertSessionHasErrors(['product_description']);
    }
}
