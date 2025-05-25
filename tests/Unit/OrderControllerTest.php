<?php

namespace Tests\Unit;

use App\Http\Controllers\OrderController;
use App\Models\Order;
use App\Models\User;
use Illuminate\Routing\Redirector;
use Illuminate\Support\Carbon;
use Tests\TestCase;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Session\Store as SessionStore;
use Illuminate\Http\RedirectResponse as HttpRedirectResponse;

class OrderControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    }

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

    /** @test */
    public function it_returns_all_orders_when_range_is_all()
    {
        Order::factory()->count(10)->create();

        $response = $this->get('/orders?range=all');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('orders/index')
            ->has('orders.data', 5)
        );
    }

    /** @test */
    public function it_returns_orders_created_today()
    {
        Order::factory()->count(3)->create([
            'created_at' => Carbon::today()->addHours(2),
        ]);

        Order::factory()->count(2)->create([
            'created_at' => Carbon::yesterday(),
        ]);

        $response = $this->get('/orders?range=today&offset=0');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('orders/index')
            ->has('orders.data', 3)
        );
    }

    /** @test */
    public function it_returns_orders_created_this_week()
    {
        $startOfWeek = Carbon::now()->startOfWeek(Carbon::SATURDAY);
        $inWeekDate = $startOfWeek->copy()->addDays(3);
        $outOfWeekDate = $startOfWeek->copy()->subWeek();

        Order::factory()->count(4)->create([
            'created_at' => $inWeekDate,
        ]);

        Order::factory()->count(2)->create([
            'created_at' => $outOfWeekDate,
        ]);

        $response = $this->get('/orders?range=week&offset=0');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('orders/index')
            ->has('orders.data', 4)
        );
    }

    /** @test */
    public function it_returns_orders_created_this_month()
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $inMonthDate = $startOfMonth->copy()->addDays(10);
        $outOfMonthDate = $startOfMonth->copy()->subMonth();

        Order::factory()->count(5)->create([
            'created_at' => $inMonthDate,
        ]);

        Order::factory()->count(2)->create([
            'created_at' => $outOfMonthDate,
        ]);

        $response = $this->get('/orders?range=month&offset=0');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('orders/index')
            ->has('orders.data', 5)
        );
    }

    /** @test */
    public function it_returns_orders_created_this_quarter()
    {
        $startOfQuarter = Carbon::now()->startOfQuarter();
        $inQuarterDate = $startOfQuarter->copy()->addDays(20);
        $outOfQuarterDate = $startOfQuarter->copy()->subQuarter();

        Order::factory()->count(6)->create([
            'created_at' => $inQuarterDate,
        ]);

        Order::factory()->count(2)->create([
            'created_at' => $outOfQuarterDate,
        ]);

        $response = $this->get('/orders?range=quarter&offset=0');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('orders/index')
            ->has('orders.data', 5)
        );
    }

    /** @test */
    public function it_returns_orders_created_this_year()
    {
        $startOfYear = Carbon::now()->startOfYear();
        $inYearDate = $startOfYear->copy()->addMonths(2);
        $outOfYearDate = $startOfYear->copy()->subYear();

        Order::factory()->count(7)->create([
            'created_at' => $inYearDate,
        ]);

        Order::factory()->count(3)->create([
            'created_at' => $outOfYearDate,
        ]);

        $response = $this->get('/orders?range=year&offset=0');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('orders/index')
            ->has('orders.data', 5)
        );
    }
}
