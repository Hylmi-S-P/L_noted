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

    public function test_ocr_endpoint_requires_authentication(): void
    {
        $file = UploadedFile::fake()->image('receipt.jpg');
        $this->postJson('/api/ocr/scan', ['receipt_image' => $file])->assertUnauthorized();
    }

    public function test_ocr_endpoint_validates_required_image(): void
    {
        $user = User::factory()->create();
        $this->withHeaders($this->authHeaderFor($user))
            ->postJson('/api/ocr/scan', [])
            ->assertStatus(422);
    }

    public function test_ocr_endpoint_accepts_image_and_returns_payload(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();
        $file = UploadedFile::fake()->image('receipt.jpg', 1200, 800);

        $response = $this->withHeaders($this->authHeaderFor($user))
            ->postJson('/api/ocr/scan', [
                'receipt_image' => $file,
            ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'receipt_image_path',
                    'raw_text',
                    'total_price',
                    'confidence',
                ],
            ]);
    }
}
