<?php

namespace Tests\Unit;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Option;
use App\Http\Controllers\OptionController;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\JsonResponse;


class OptionControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_delete_logo_deletes_file_and_updates_database()
    {
        $disk = config('filesystems.upload', 'public');
        Storage::fake($disk);

        $filePath = 'company_logo/test-logo.png';
        Storage::disk($disk)->put($filePath, 'dummy content');

        $url = Storage::disk($disk)->url($filePath);
        $option = Option::create([
            'key' => 'logo',
            'value' => $url,
        ]);

        $controller = new OptionController();
        $response = $controller->deleteLogo();

        Storage::disk($disk)->assertMissing($filePath);

        $this->assertDatabaseHas('options', [
            'id' => $option->id,
            'key' => 'logo',
            'value' => null,
        ]);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(
            ['message' => 'Logo deleted successfully'],
            $response->getData(true)
        );
    }
}
