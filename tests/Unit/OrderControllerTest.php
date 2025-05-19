<?php

namespace Tests\Unit;

use App\Models\User;
use Tests\TestCase;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;

class OrderControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_returns_paginated_products_in_create()
    {

        $user = User::factory()->create();
        $this->actingAs($user);

        Product::factory()->count(25)->create();

        $response = $this->get('/orders/create');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('orders/create')
            ->has('products.data', 5)
            ->where('products.current_page', 1)
        );
    }
}
