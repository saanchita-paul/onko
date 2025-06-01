<?php

namespace Tests\Unit;

use App\Http\Controllers\OrderController;
use App\Http\Requests\SaveTempTaxDiscountRequest;
use App\Models\Consignment;
use App\Models\ConsignmentItem;
use App\Models\Option;
use App\Models\Order;
use App\Models\Payment;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Redirector;
use Illuminate\Support\Carbon;
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

        $consignment = Consignment::factory()->create();

        $products = Product::factory()->count(25)->create();

        $variant = ProductVariant::factory()->create([
            'product_id' => $products->first()->id,
        ]);
        foreach ($products as $product) {
           ConsignmentItem::factory()->create([
                'product_id' => $product->id,
                'product_variant_id' => $variant->id,
                'consignment_id' => $consignment->id,
                'qty' => rand(1, 10),
            ]);
        }

        ConsignmentItem::factory()->create([
            'product_id' => $products->first()->id,
            'product_variant_id' => $variant->id,
            'consignment_id' => $consignment->id,
            'qty' => 5,
        ]);

        $response = $this->get('/orders/create');

        $response->assertStatus(200);

        $response->assertInertia(fn ($page) =>
        $page->component('orders/create')
            ->has('products.data', 5)
            ->where('products.current_page', 1)
            ->has('products.data.0', fn ($product) =>
            $product
                ->hasAll([
                    'id',
                    'name',
                    'price',
                    'quantity',
                    'variant_id',
                    'variant_name',
                    'variant_options',
                ])
            )
        );
    }


    public function test_reset_clears_session_and_redirects()
    {
        $session = \Mockery::mock(SessionStore::class);
        $session->shouldReceive('forget')->once()->with('user_order_session');
        $session->shouldReceive('forget')->once()->with('temp_tax_discount');
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

    public function it_clears_temp_tax_discount_from_session()
    {
        session(['temp_tax_discount' => ['tax' => 5, 'discount' => 10]]);

        $this->assertTrue(session()->has('temp_tax_discount'));

        $response = $this->postJson(route('clear.temp.tax.discount'));

        $this->assertFalse(session()->has('temp_tax_discount'));

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Temporary tax and discount session cleared.',
            ]);
    }

    public function test_mark_as_paid_creates_payment_and_updates_order()
    {
        $order = Mockery::mock(Order::class)->makePartial();
        $order->id = 'order-uuid-1234';
        $order->grand_total = 1000;
        $order->payments_total = 500;

        $paymentMock = Mockery::mock('alias:' . Payment::class);
        $paymentInstance = new Payment([
            'order_id' => $order->id,
            'payment_amount' => $order->grand_total,
            'payment_type' => 'cash',
            'status' => 'paid',
        ]);

        $paymentInstance->payment_amount = $order->grand_total;

        $paymentMock->shouldReceive('create')
            ->once()
            ->with([
                'order_id' => $order->id,
                'payment_amount' => $order->grand_total,
                'payment_type' => 'cash',
                'status' => 'paid',
            ])
            ->andReturn($paymentInstance);

        $order->shouldReceive('update')
            ->once()
            ->with([
                'status' => 'paid',
                'payments_total' => $order->payments_total + $order->grand_total,
            ])
            ->andReturnUsing(function ($attributes) use ($order) {
                $order->status = $attributes['status'];
                $order->payments_total = $attributes['payments_total'];
                return true;
            });
        $request = new Request();
        $controller = new OrderController();
        $response = $controller->markAsPaid($order, $request);

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals([
            'message' => 'Order marked as paid successfully!',
            'order_status' => 'paid',
        ], $response->getData(true));
    }

}
