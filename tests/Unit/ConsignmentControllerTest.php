<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConsignmentControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_creates_a_consignment_with_items()
    {
        $this->withoutExceptionHandling();

        $user = User::factory()->create();
        $this->actingAs($user);

        // Create products and variants
        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->create(['product_id' => $product->id]);

        // Prepare payload
        $payload = [
            'lc_num' => 'LC-12345',
            'value' => 200,
            'items' => [
                [
                    'product' => $product->id,
                    'variant' => $variant->id,
                    'quantity' => 2,
                    'price' => 100, // 2 × 100 = 200
                ],
            ],
        ];

        $response = $this->post(route('consignments.store'), $payload);

        $response->assertRedirect(route('consignments.index'));
        $response->assertSessionHas('success', 'Consignment Added Successfully');

        $this->assertDatabaseHas('consignments', [
            'lc_num' => 'LC-12345',
            'value' => 20000, // Stored as cents
        ]);

        $this->assertDatabaseHas('consignment_items', [
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'qty' => 2,
            'cost_price' => 10000, // Stored as cents
        ]);
    }

    /** @test */
    public function it_requires_required_fields()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $payload = [];

        $response = $this->post(route('consignments.store'), $payload);

        $response->assertSessionHasErrors(['items']);
    }

    /** @test */
    public function it_requires_at_least_one_item()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $payload = [
            'lc_num' => 'LC-00001',
            'value' => 100,
            'items' => [],
        ];

        $response = $this->post(route('consignments.store'), $payload);

        $response->assertSessionHasErrors(['items']);
    }

    /** @test */
    public function it_fails_if_value_does_not_match_total()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->create(['product_id' => $product->id]);

        $payload = [
            'lc_num' => 'LC-54321',
            'value' => 250, // Incorrect, should be 2×100 = 200
            'items' => [
                [
                    'product' => $product->id,
                    'variant' => $variant->id,
                    'quantity' => 2,
                    'price' => 100,
                ],
            ],
        ];

        $response = $this->post(route('consignments.store'), $payload);

        $response->assertSessionHasErrors(['value']);
        $this->assertDatabaseCount('consignments', 0);
        $this->assertDatabaseCount('consignment_items', 0);
    }

    /** @test */
    public function it_requires_quantity_and_price_to_be_numeric_and_positive()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->create(['product_id' => $product->id]);

        $payload = [
            'lc_num' => 'LC-INVALID',
            'value' => 100,
            'items' => [
                [
                    'product' => $product->id,
                    'variant' => $variant->id,
                    'quantity' => -1,
                    'price' => 'free', // Invalid
                ],
            ],
        ];

        $response = $this->post(route('consignments.store'), $payload);

        $response->assertSessionHasErrors(['items.0.quantity', 'items.0.price']);
    }
}
