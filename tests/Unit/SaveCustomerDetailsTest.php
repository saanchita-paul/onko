<?php

namespace Tests\Unit;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SaveCustomerDetailsTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_saves_customer_details()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $payload = [
            'name' => 'Customer Name',
        ];

        $response = $this->postJson(route('customers.store'), $payload);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'customer' => [
                'name' => 'Customer Name',
            ],
            'message' => 'Customer created successfully',
        ]);

        $this->assertDatabaseHas('customers', [
            'name' => 'Customer Name',
        ]);
    }
}
