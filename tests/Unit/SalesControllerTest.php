<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class SalesControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        // Current month: 5 orders
        Order::factory()->count(5)->create([
            'created_at' => Carbon::now()->subDays(5),
            'grand_total' => 1000
        ]);

        // Current week: 3 orders
        Order::factory()->count(3)->create([
            'created_at' => Carbon::now()->startOfWeek()->addDays(1),
            'grand_total' => 2000
        ]);

        // Last week: 2 orders
        Order::factory()->count(2)->create([
            'created_at' => Carbon::now()->subWeek()->startOfWeek()->addDays(2),
            'grand_total' => 3000
        ]);

        // Last month: 2 orders
        Order::factory()->count(2)->create([
            'created_at' => Carbon::now()->subMonth()->startOfMonth()->addDays(3),
            'grand_total' => 4000
        ]);

        // 2nd last month: 3 orders
        Order::factory()->count(3)->create([
            'created_at' => Carbon::now()->subMonths(2)->startOfMonth()->addDays(3),
            'grand_total' => 5000
        ]);
    }

    /** @test */
    public function it_returns_sales_data_for_all_range()
    {
        $response = $this->get('/sales?range=all');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('sales/index')
            ->where('total_order', 15)
            ->has('orders', 15)
        );
    }

    /** @test */
    public function it_returns_sales_data_for_week_range()
    {
        $response = $this->get('/sales?range=week');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('sales/index')
            ->where('total_order', 3)
            ->has('orders', 3)
            ->where('comparison.total_order', fn ($val) => str_contains($val, 'Since Last Week'))
        );
    }

    /** @test */
    public function it_returns_sales_data_for_month_range()
    {
        $response = $this->get('/sales?range=month');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('sales/index')
            ->where('total_order', 10)
            ->has('orders', 10)
            ->where('comparison.total_order', fn ($val) => str_contains($val, 'Since Last Month'))
        );
    }

    /** @test */
    public function it_returns_sales_data_for_quarter_range()
    {
        $response = $this->get('/sales?range=quarter');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('sales/index')
            ->where('total_order', 12)
            ->has('orders', 12)
            ->where('comparison.total_order', fn ($val) => str_contains($val, 'Since Last Quarter'))
        );
    }

    /** @test */
    public function it_returns_sales_data_for_year_range()
    {
        $response = $this->get('/sales?range=year');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('sales/index')
            ->where('total_order', 15)
            ->has('orders', 15)
            ->where('comparison.total_order', fn ($val) => str_contains($val, 'Since Last Year'))
        );
    }

    /** @test */
    public function it_returns_sales_data_for_custom_range()
    {
        $from = Carbon::now()->startOfMonth()->format('Y-m-d');
        $to = Carbon::now()->endOfMonth()->format('Y-m-d');

        $response = $this->get('/sales?range=custom&date_range[from]=' . $from . '&date_range[to]=' . $to);

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('sales/index')
            ->where('total_order', 10)
            ->has('orders', 10)
            ->where('comparison.total_order', '')
        );
    }

}
