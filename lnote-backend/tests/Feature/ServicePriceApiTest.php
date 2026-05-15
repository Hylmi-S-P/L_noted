<?php

namespace Tests\Feature;

use App\Models\ServicePrice;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServicePriceApiTest extends TestCase
{
    use RefreshDatabase;

    private function authHeaderFor(User $user): array
    {
        $token = $user->createToken('test-token')->plainTextToken;
        return ['Authorization' => 'Bearer '.$token];
    }

    public function test_authenticated_user_can_crud_service_prices(): void
    {
        $user = User::factory()->create();
        $headers = $this->authHeaderFor($user);

        $create = $this->withHeaders($headers)->postJson('/api/service-prices', [
            'service_type' => 'wash_iron',
            'price_per_kg' => 9000,
            'unit' => 'kg',
        ]);

        $create->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.service_type', 'wash_iron')
            ->assertJsonPath('data.price_per_kg', 9000);

        $id = $create->json('data.id');

        $this->withHeaders($headers)
            ->getJson('/api/service-prices')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->withHeaders($headers)
            ->putJson('/api/service-prices/'.$id, [
                'price_per_kg' => 10000,
            ])
            ->assertOk()
            ->assertJsonPath('data.price_per_kg', 10000);

        $this->withHeaders($headers)
            ->deleteJson('/api/service-prices/'.$id)
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_user_cannot_delete_global_service_price(): void
    {
        $user = User::factory()->create();
        $global = ServicePrice::factory()->create(['user_id' => null]);

        $this->withHeaders($this->authHeaderFor($user))
            ->deleteJson('/api/service-prices/'.$global->id)
            ->assertStatus(422)
            ->assertJsonPath('message', 'Layanan ini sudah dipakai, jadi tidak bisa dihapus.');
    }

    public function test_user_cannot_delete_service_price_used_by_transaction(): void
    {
        $user = User::factory()->create();
        $service = ServicePrice::factory()->create(['user_id' => $user->id]);
        Transaction::factory()->create([
            'user_id' => $user->id,
            'service_price_id' => $service->id,
        ]);

        $this->withHeaders($this->authHeaderFor($user))
            ->deleteJson('/api/service-prices/'.$service->id)
            ->assertStatus(422)
            ->assertJsonPath('message', 'Layanan ini sudah dipakai, jadi tidak bisa dihapus.');
    }
}
