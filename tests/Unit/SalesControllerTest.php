<?php

namespace Tests\Unit;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SalesControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function sales_index_page_returns_correct_data()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get('/sales');

        $response->assertStatus(200);

        $response->assertInertia(fn ($page) =>
        $page->component('sales/index')
            ->where('grand_total', 0)
            ->where('total_order', 0)
            ->where('average_value', 0)
            ->has('orders', 0)
            ->has('comparison.grand_total')
            ->has('comparison.total_order')
            ->has('comparison.average_value')
        );
    }
}
