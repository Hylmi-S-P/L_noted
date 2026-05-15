<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IntegrationApiTest extends TestCase
{
    use RefreshDatabase;

    private function authHeaderFor(User $user): array
    {
        $token = $user->createToken('test-token')->plainTextToken;
        return ['Authorization' => 'Bearer '.$token];
    }

    public function test_status_endpoint_returns_integration_flags(): void
    {
        $user = User::factory()->create();

        $this->withHeaders($this->authHeaderFor($user))
            ->getJson('/api/integrations/status')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'google_vision_configured',
                    'fcm_configured',
                    'device_token_saved',
                ],
            ]);
    }
}
