<?php

namespace Tests\Unit;

use App\Http\Controllers\OrderController;
use App\Http\Requests\SaveTempTaxDiscountRequest;
use App\Models\ConsignmentItem;
use App\Models\Option;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Routing\Redirector;
use Inertia\Response;
use Mockery;
use Tests\TestCase;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Session\Store as SessionStore;
use Illuminate\Http\RedirectResponse as HttpRedirectResponse;
use Illuminate\Support\Facades\Session;
use Illuminate\Http\RedirectResponse;


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

    public function test_reset_clears_session_and_redirects()
    {
        $session = \Mockery::mock(SessionStore::class);
        $session->shouldReceive('forget')->once()->with('user_order_session');
        $session->shouldReceive('get')->andReturn([]);

        $this->app->make(Redirector::class);
        $routeName = 'orders.create';
        $url = route($routeName);

        $this->app->instance('session', $session);

        $controller = new OrderController();

        $response = $controller->reset();

        $this->assertInstanceOf(HttpRedirectResponse::class, $response);
        $this->assertEquals($url, $response->getTargetUrl());
        $this->assertTrue($response->getSession()->get('isReset'));
    }

    public function it_saves_temp_tax_discount_to_session()
    {
        $validatedData = [
            'tax' => 15,
            'tax_type' => 'percentage',
            'tax_description' => 'Service Tax',
            'discount' => 7,
            'discount_type' => 'fixed',
            'discount_description' => 'Festival Offer',
        ];

        $request = Mockery::mock(SaveTempTaxDiscountRequest::class);
        $request->shouldReceive('validated')->once()->andReturn($validatedData);

        Session::start();

        $controller = new OrderController();
        $response = $controller->saveTempTaxDiscount($request);

        $this->assertEquals(session('temp_tax_discount'), [
            'tax' => 15,
            'tax_type' => 'percentage',
            'tax_description' => 'Service Tax',
            'discount' => 7,
            'discount_type' => 'fixed',
            'discount_description' => 'Festival Offer',
        ]);

        $this->assertInstanceOf(RedirectResponse::class, $response);
        $this->assertEquals(session('message'), 'Temporary tax and discount saved in session.');
    }



}
