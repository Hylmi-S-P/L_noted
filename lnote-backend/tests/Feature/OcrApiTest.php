<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class OcrApiTest extends TestCase
{
    use RefreshDatabase;

    private function authHeaderFor(User $user): array
    {
        $token = $user->createToken('test-token')->plainTextToken;
        return ['Authorization' => 'Bearer '.$token];
    }

    public function test_authenticated_user_can_upload_receipt_for_ocr(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();

        $response = $this->withHeaders($this->authHeaderFor($user))
            ->postJson('/api/ocr/scan', [
                'image' => UploadedFile::fake()->image('receipt.jpg'),
            ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'receipt_image_path',
                    'total_price',
                    'raw_text',
                    'confidence',
                    'provider_status',
                    'provider_error_code',
                    'provider_error_message',
                ],
            ]);
    }
}
