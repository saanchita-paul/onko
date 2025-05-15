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

    /** @test */
    public function store_employee_page_returns_correct_data(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $employee = Employee::factory()->create();
        $response = $this->post('/employees', [
            'name' => $employee->name,
            'position' => $employee->position,
            'hired_on' => $employee->hired_on,
        ]);
        $response->assertStatus(302);
        $response->assertRedirect(route('employees.index'));
        $response->assertSessionHas('success', 'Employee Added Successfully');
    }

    /** @test */
    public function store_employee_page_fails_with_invalid_data(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        // Missing 'hired_on' and 'name' fields (required)
        $response = $this->post('/employees', [
            'name' => '',       // empty name
            'position' => 'Manager',
            // 'hired_on' => missing on purpose
        ]);

        $response->assertStatus(302);
        $response->assertSessionHasErrors(['name', 'hired_on']);
    }
}
