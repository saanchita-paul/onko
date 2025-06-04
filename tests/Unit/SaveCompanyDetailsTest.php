<?php

namespace Tests\Unit;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Mockery;
use Tests\TestCase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use App\Models\Option;
use App\Http\Controllers\Api\OptionController;
use Illuminate\Http\RedirectResponse;


class SaveCompanyDetailsTest extends TestCase
{
    use RefreshDatabase;


    public function test_store_saves_company_details_and_logo()
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('logo.jpg');

        $user = User::factory()->create();
        $this->actingAs($user);

        $payload = [
            'company_name' => 'Test Company',
            'company_address' => 'Test Address',
            'logo' => $file,
        ];

        $response = $this->post(route('options.store'), $payload);

        $response->assertStatus(200);

        $this->assertDatabaseHas('options', [
            'key' => 'company_name',
            'value' => 'Test Company',
        ]);
        $this->assertDatabaseHas('options', [
            'key' => 'company_address',
            'value' => 'Test Address',
        ]);

        Storage::disk('public')->assertExists('company_logo/' . $file->hashName());
    }





}
