<?php

namespace Tests\Unit;

use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use Tests\TestCase;

class SupplierControllerTest extends TestCase
{
    use RefreshDatabase;

    public function it_displays_paginated_suppliers()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $suppliers = Supplier::factory()->count(25)->create();

        $response = $this->get('/suppliers');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('suppliers/index')
            ->has('suppliers.data', 5)
            ->where('suppliers.current_page', 1)
            ->where('suppliers.data.0.id', $suppliers[0]->id)
            ->where('suppliers.data.0.name', $suppliers[0]->name)
        );
    }
}
