<?php

namespace Tests\Unit;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmployeeControllerTest extends TestCase
{
    use RefreshDatabase;
    /** @test */
    public function employee_index_page_returns_correct_data(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        Employee::factory()->count(25)->create();

        $response = $this->get('/employees');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
        $page->component('employees/index')
            ->has('employees.data', 10)
            ->where('employees.current_page', 1)
        );
    }
}
