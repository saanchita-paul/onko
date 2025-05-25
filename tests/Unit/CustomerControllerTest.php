<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class CustomerControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    }

    /** @test */
    public function it_returns_all_customers_when_range_is_all()
    {
        Customer::factory()->count(10)->create();

        $response = $this->get('/customers?range=all');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('customers/index')
            ->has('customers.data', 5)
        );
    }

    /** @test */
    public function it_returns_customers_created_today()
    {
        Customer::factory()->count(3)->create([
            'created_at' => Carbon::today()->addHours(2),
        ]);

        Customer::factory()->count(2)->create([
            'created_at' => Carbon::yesterday(),
        ]);

        $response = $this->get('/customers?range=today&offset=0');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('customers/index')
            ->has('customers.data', 3)
        );
    }

    /** @test */
    public function it_returns_customers_created_this_week()
    {
        $startOfWeek = Carbon::now()->startOfWeek(Carbon::SATURDAY);
        $inWeekDate = $startOfWeek->copy()->addDays(3);
        $outOfWeekDate = $startOfWeek->copy()->subWeek();

        Customer::factory()->count(4)->create([
            'created_at' => $inWeekDate,
        ]);

        Customer::factory()->count(2)->create([
            'created_at' => $outOfWeekDate,
        ]);

        $response = $this->get('/customers?range=week&offset=0');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('customers/index')
            ->has('customers.data', 4)
        );
    }

    /** @test */
    public function it_returns_customers_created_this_month()
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $inMonthDate = $startOfMonth->copy()->addDays(10);
        $outOfMonthDate = $startOfMonth->copy()->subMonth();

        Customer::factory()->count(5)->create([
            'created_at' => $inMonthDate,
        ]);

        Customer::factory()->count(2)->create([
            'created_at' => $outOfMonthDate,
        ]);

        $response = $this->get('/customers?range=month&offset=0');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('customers/index')
            ->has('customers.data', 5)
        );
    }

    /** @test */
    public function it_returns_customers_created_this_quarter()
    {
        $startOfQuarter = Carbon::now()->startOfQuarter();
        $inQuarterDate = $startOfQuarter->copy()->addDays(20);
        $outOfQuarterDate = $startOfQuarter->copy()->subQuarter();

        Customer::factory()->count(6)->create([
            'created_at' => $inQuarterDate,
        ]);

        Customer::factory()->count(2)->create([
            'created_at' => $outOfQuarterDate,
        ]);

        $response = $this->get('/customers?range=quarter&offset=0');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('customers/index')
            ->has('customers.data', 5)
        );
    }

    /** @test */
    public function it_returns_customers_created_this_year()
    {
        $startOfYear = Carbon::now()->startOfYear();
        $inYearDate = $startOfYear->copy()->addMonths(2);
        $outOfYearDate = $startOfYear->copy()->subYear();

        Customer::factory()->count(7)->create([
            'created_at' => $inYearDate,
        ]);

        Customer::factory()->count(3)->create([
            'created_at' => $outOfYearDate,
        ]);

        $response = $this->get('/customers?range=year&offset=0');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('customers/index')
            ->has('customers.data', 5)
        );
    }
}
