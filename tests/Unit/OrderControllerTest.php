<?php

namespace Tests\Unit;

use App\Http\Controllers\OrderController;
use App\Http\Controllers\StockController;
use App\Http\Requests\SaveTempTaxDiscountRequest;
use App\Http\Requests\StoreOrderRequest;
use App\Models\Consignment;
use App\Models\ConsignmentItem;
use App\Models\Customer;
use App\Models\Option;
use App\Models\Order;
use App\Models\Payment;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Routing\Redirector;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
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


    public function test_it_returns_paginated_products()
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
                'qty_sold' => 0,
                'qty_waste' => 0,
            ]);
        }

        ConsignmentItem::factory()->create([
            'product_id' => $products->first()->id,
            'product_variant_id' => $variant->id,
            'consignment_id' => $consignment->id,
            'qty' => 5,
            'qty_sold' => 0,
            'qty_waste' => 0,
        ]);

        $response = $this->getJson(route('stock.index'));

        $response->assertStatus(200);

        $response->assertJsonStructure([
            'products' => [
                'current_page',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'price',
                        'quantity',
                        'variant_id',
                        'variant_name',
                        'variant_options',
                    ],
                ],
                'first_page_url',
                'from',
                'last_page',
                'last_page_url',
                'links',
                'next_page_url',
                'path',
                'per_page',
                'prev_page_url',
                'to',
                'total',
            ],
        ]);

        $firstProduct = $response->json('products.data.0');

        $this->assertArrayHasKey('id', $firstProduct);
        $this->assertArrayHasKey('name', $firstProduct);
        $this->assertArrayHasKey('price', $firstProduct);
        $this->assertArrayHasKey('quantity', $firstProduct);
        $this->assertArrayHasKey('variant_id', $firstProduct);
        $this->assertArrayHasKey('variant_name', $firstProduct);
        $this->assertArrayHasKey('variant_options', $firstProduct);

        $variantOptions = $firstProduct['variant_options'];
        $this->assertTrue(is_array($variantOptions) || is_string($variantOptions));

        if (is_string($variantOptions)) {
            $decoded = json_decode($variantOptions, true);
            $this->assertIsArray($decoded);
        }
    }


    public function test_create_returns_company_details_and_customers()
    {
        Option::insert([
            ['key' => 'company_name', 'value' => 'Test Company'],
            ['key' => 'company_address', 'value' => '123 Test St'],
            ['key' => 'logo', 'value' => 'logo.png'],
        ]);

        Customer::factory()->count(3)->create(['name' => 'John Doe']);

        $response = $this->get('/orders/create');

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->where('companyDetails.company_name', 'Test Company')
                ->where('companyDetails.company_address', '123 Test St')
                ->where('companyDetails.logo', 'logo.png')
                ->has('customers.data', 2)
            );
    }

    public function test_reset_clears_session_and_redirects()
    {
        $session = \Mockery::mock(SessionStore::class);
        $session->shouldReceive('forget')->once()->with('user_order_session');
        $session->shouldReceive('forget')->once()->with('temp_tax_discount');
        $session->shouldReceive('forget')->once()->with('order_on');
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



    public function test_store_creates_order_with_items_and_applies_tax_discount()
    {
        $customer = Customer::factory()->create();
        $product = Product::factory()->create();
        $productVariant = ProductVariant::factory()->create();
        $consignment = Consignment::factory()->create();

        $consignmentItem = ConsignmentItem::factory()->create([
            'product_id' => $product->id,
            'product_variant_id' => $productVariant->id,
            'qty' => 10,
            'qty_sold' => 0,
            'qty_waste' => 0,
            'consignment_id' => $consignment->id,
        ]);

        session()->put('temp_tax_discount', [
            'tax' => 10,
            'tax_type' => 'percentage',
            'tax_description' => '10% Tax',
            'discount' => 5,
            'discount_type' => 'percentage',
            'discount_description' => '5% Discount',
        ]);

        $requestData = [
            'customer_id' => $customer->id,
            'sub_total' => 100,
            'grand_total' => 100,
            'items' => [
                [
                    'id' => $product->id,
                    'variant_id' => $productVariant->id,
                    'qty' => 2,
                    'price' => 50,
                ],
            ],
        ];

        $request = Mockery::mock(StoreOrderRequest::class);
        $request->shouldReceive('validated')->andReturn($requestData);

        $controller = app(OrderController::class);
        $response = $controller->store($request);

        $this->assertInstanceOf(RedirectResponse::class, $response);

        $order = Order::where('customer_id', $customer->id)->latest()->first();
        $this->assertNotNull($order, 'Order was not created');

        $this->assertEquals(10, $order->tax_total);
        $this->assertEquals(5, $order->discount_total);
        $this->assertEquals(105, $order->grand_total);
        $this->assertCount(1, $order->orderItems);
        $this->assertEquals($consignmentItem->id, $order->orderItems->first()->consignment_item_id);
        $this->assertEquals(2, $order->orderItems->first()->qty);
        $this->assertEquals(50, $order->orderItems->first()->unit_price);
        $consignmentItem->refresh();
        $this->assertEquals(2, $consignmentItem->qty_sold, 'Consignment item qty_sold was not updated correctly.');

    }




    public function test_it_returns_orders_in_custom_date_range()
    {
        $from = Carbon::parse('2025-04-30T18:00:00.000Z');
        $to = Carbon::parse('2025-05-16T18:00:00.000Z');

        Order::factory()->count(5)->create([
            'created_at' => $from->copy()->addDays(1),
        ]);

        Order::factory()->count(2)->create([
            'created_at' => $from->copy()->subDays(1),
        ]);

        Order::factory()->count(3)->create([
            'created_at' => $to->copy()->addDays(1),
        ]);

        $response = $this->get('/orders?' . http_build_query([
                'range' => 'custom',
                'offset' => 0,
                'date_range' => [
                    'from' => $from->toIso8601String(),
                    'to' => $to->toIso8601String(),
                ],
            ]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('orders/index')
            ->has('orders.data', 5)
        );
    }


}
