<?php

namespace Tests\Feature;

use App\Models\Consignment;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class SalesControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    /** @test */
    public function it_returns_sales_data_for_all_range()
    {
        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        Order::factory()->count(15)->create([
            'created_at' => Carbon::now(),
            'grand_total' => 1000
        ]);

        $response = $this->get('/sales?range=all');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('sales/index')
            ->where('total_order', 15)
            ->has('orders', 15)
            ->has('chartData')
            ->where('chartData.0', fn ($chartEntry) =>
                isset($chartEntry['date']) && isset($chartEntry['sales'])
            )
        );
    }

    /** @test */
    public function it_returns_sales_data_for_today()
    {
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
        Order::factory()->count(4)->create([
            'created_at' => Carbon::now(),
            'grand_total' => 2000
        ]);

        Order::factory()->count(3)->create([
            'created_at' => Carbon::now()->subDays(1),
            'grand_total' => 2100
        ]);

        $response = $this->get('/sales?range=today');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('sales/index')
            ->where('total_order', 4)
            ->has('orders', 4)
            ->where('comparison.total_order', fn ($val) => str_contains($val, 'Since Yesterday'))
            ->has('chartData')
            ->where('chartData.0', fn ($chartEntry) =>
                isset($chartEntry['date']) && isset($chartEntry['sales'])
            )
        );

    }

    /** @test */
    public function it_returns_sales_data_for_week_range()
    {
        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        // Current week: 3 orders
        Order::factory()->count(3)->create([
            'created_at' => Carbon::now(),
            'grand_total' => 2000
        ]);

        // Last week: 2 orders
        Order::factory()->count(2)->create([
            'created_at' => Carbon::now()->subWeek()->startOfWeek()->addDays(2),
            'grand_total' => 3000
        ]);

        $response = $this->get('/sales?range=week');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('sales/index')
            ->where('total_order', 3)
            ->has('orders', 3)
            ->where('comparison.total_order', fn ($val) => str_contains($val, 'Since Last Week'))
            ->has('chartData')
            ->where('chartData.0', fn ($chartEntry) =>
                isset($chartEntry['date']) && isset($chartEntry['sales'])
            )
        );
    }

    /** @test */
    public function it_returns_sales_data_for_month_range()
    {
        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        // Current month: 5 orders
        Order::factory()->count(5)->create([
            'created_at' => Carbon::now(),
            'grand_total' => 1000
        ]);

        // Last month: 2 orders
        Order::factory()->count(2)->create([
            'created_at' => Carbon::now()->subMonth()->startOfMonth()->addDays(3),
            'grand_total' => 4000
        ]);


        $response = $this->get('/sales?range=month');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('sales/index')
            ->where('total_order', 5)
            ->has('orders', 5)
            ->where('comparison.total_order', fn ($val) => str_contains($val, 'Since Last Month'))
            ->has('chartData')
            ->where('chartData.0', fn ($chartEntry) =>
                isset($chartEntry['date']) && isset($chartEntry['sales'])
            )
        );
    }

    /** @test */
    public function it_returns_sales_data_for_quarter_range()
    {
        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        Order::factory()->count(5)->create([
            'created_at' => Carbon::now(),
            'grand_total' => 2000,
        ]);

        Order::factory()->count(6)->create([
            'created_at' => Carbon::now()->subQuarter()->startOfQuarter()->addDays(15),
            'grand_total' => 2000,
        ]);

        $response = $this->get('/sales?range=quarter');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('sales/index')
            ->where('total_order', 5)
            ->has('orders', 5)
            ->where('comparison.total_order', fn ($val) => str_contains($val, 'Since Last Quarter'))
            ->has('chartData')
            ->where('chartData.0', fn ($chartEntry) =>
                isset($chartEntry['date']) && isset($chartEntry['sales'])
            )
        );
    }

    /** @test */
    public function it_returns_sales_data_for_year_range()
    {
        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        Order::factory()->count(4)->create([
            'created_at' => Carbon::now(),
            'grand_total' => 3000,
        ]);

        Order::factory()->count(3)->create([
            'created_at' => Carbon::now()->subYear()->startOfYear()->addMonths(6),
            'grand_total' => 3000,
        ]);

        $response = $this->get('/sales?range=year');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('sales/index')
            ->where('total_order', 4)
            ->has('orders', 4)
            ->where('comparison.total_order', fn ($val) => str_contains($val, 'Since Last Year'))
            ->has('chartData')
            ->where('chartData.0', fn ($chartEntry) =>
                isset($chartEntry['date']) && isset($chartEntry['sales'])
            )
        );
    }

    /** @test */
    public function it_returns_sales_data_for_custom_range()
    {
        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        Order::factory()->count(5)->create([
            'created_at' => Carbon::now(),
            'grand_total' => 1000
        ]);

        $from = Carbon::now()->startOfMonth()->format('Y-m-d');
        $to = Carbon::now()->endOfMonth()->format('Y-m-d');

        $response = $this->get('/sales?range=custom&date_range[from]=' . $from . '&date_range[to]=' . $to);

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('sales/index')
            ->where('total_order', 5)
            ->has('orders', 5)
            ->where('comparison.total_order', '')
            ->has('chartData')
            ->where('chartData.0', fn ($chartEntry) =>
                isset($chartEntry['date']) && isset($chartEntry['sales'])
            )
        );
    }

    public function test_best_sellers_for_all_time()
    {
        $this->actingAs(User::factory()->create());

        Consignment::factory()->count(2)->create();

        $orders = Order::factory()
            ->count(50)
            ->create();


        $orders->load('orderItems.consignmentItem');

        $orders = $orders->map(fn($order) => $order->orderItems);
        $grouped  = $orders->collapse()->map(function($item) {

            return [
                'id' => $item->id,
                'product_id' => $item->consignmentItem->product_id,
                'qty' => $item->qty,
                'unit_price' => intdiv($item->unit_price,100),
                'subtotal' => $item->qty * intdiv($item->unit_price,100),
            ];
        })->groupBy('product_id');
        $bestSellers = collect([]);

        $grouped->each(function($item) use (&$bestSellers) {
            $val = [
                'product_id' => $item->first()['product_id'],
                'total_qty' => $item->reduce(fn($carry, $value) => $carry + $value['qty'], 0),
                'total_value' => $item->reduce(fn($carry, $value) => $carry + $value['subtotal'], 0)
            ];

            $bestSellers->push($val);

        });

        $bestSellerByQty = $bestSellers->sortByDesc('total_qty')->values()->all();
        $bestSellerByValue = $bestSellers->sortByDesc('total_value')->values()->all();
        $response = $this->get(route('sales.index'));

        $response->assertStatus(200);
        $response->assertInertia(function($page) use ($bestSellerByQty, $bestSellerByValue){
            $page->component('sales/index')
                ->has('bQuantity', 10)
                ->where('bQuantity.0.sum_qty', $bestSellerByQty[0]['total_qty'])
                ->where('bQuantity.0.id', $bestSellerByQty[0]['product_id'])
                ->has('bSubTotal', 10)
                ->where('bSubTotal.0.id', $bestSellerByValue[0]['product_id']);
        });

        $this->assertTrue(true);

        Order::factory()
            ->count(50)
            ->create([
                'created_at' => Carbon::now()->addWeek(),
            ]);

        $response = $this->get(route('sales.index', ['range' => 'week']));

        $response->assertInertia(function($page) use ($bestSellerByQty, $bestSellerByValue){
            $page->component('sales/index')
                ->has('bQuantity', 10)
                ->where('bQuantity.0.sum_qty', $bestSellerByQty[0]['total_qty'])
                ->where('bQuantity.0.id', $bestSellerByQty[0]['product_id'])
                ->has('bSubTotal', 10)
                ->where('bSubTotal.0.id', $bestSellerByValue[0]['product_id']);
        });

        $this->assertTrue(true);
    }

    public function test_best_sellers_for_week()
    {
        $this->bestSellersTestHelper('week');
    }

    public function test_best_sellers_for_month()
    {
        $this->bestSellersTestHelper('month');
    }

    public function test_best_sellers_for_quarter()
    {
        $this->bestSellersTestHelper('quarter');
    }

    public function test_best_sellers_for_year()
    {
        $this->bestSellersTestHelper('year');
    }

    private function bestSellersTestHelper($period)
    {
        $date = match ($period) {
            'week' => Carbon::now()->addWeek(),
            'month' => Carbon::now()->addMonth(),
            'quarter' => Carbon::now()->addQuarter(),
            'year' => Carbon::now()->addYear(),
        };

        $this->actingAs(User::factory()->create());

        Consignment::factory()->count(2)->create();

        $orders = Order::factory()
            ->count(50)
            ->create();

        Order::factory()
            ->count(50)
            ->create([
                'created_at' => $date,
            ]);


        $orders->load('orderItems.consignmentItem');

        $orders = $orders->map(fn($order) => $order->orderItems);
        $grouped  = $orders->collapse()->map(function($item) {

            return [
                'id' => $item->id,
                'product_id' => $item->consignmentItem->product_id,
                'qty' => $item->qty,
                'unit_price' => intdiv($item->unit_price,100),
                'subtotal' => $item->qty * intdiv($item->unit_price,100),
            ];
        })->groupBy('product_id');
        $bestSellers = collect([]);

        $grouped->each(function($item) use (&$bestSellers) {
            $val = [
                'product_id' => $item->first()['product_id'],
                'total_qty' => $item->reduce(fn($carry, $value) => $carry + $value['qty'], 0),
                'total_value' => $item->reduce(fn($carry, $value) => $carry + $value['subtotal'], 0)
            ];

            $bestSellers->push($val);

        });

        $bestSellerByQty = $bestSellers->sortByDesc('total_qty')->values()->all();
        $bestSellerByValue = $bestSellers->sortByDesc('total_value')->values()->all();
        $response = $this->get(route('sales.index', ['range' => $period]));

        $response->assertStatus(200);
        $response->assertInertia(function($page) use ($bestSellerByQty, $bestSellerByValue){
            $page->component('sales/index')
                ->has('bQuantity', 10)
                ->where('bQuantity.0.sum_qty', $bestSellerByQty[0]['total_qty'])
                ->where('bQuantity.0.id', $bestSellerByQty[0]['product_id'])
                ->has('bSubTotal', 10)
                ->where('bSubTotal.0.id', $bestSellerByValue[0]['product_id']);
        });

        $this->assertTrue(true);
    }

}
