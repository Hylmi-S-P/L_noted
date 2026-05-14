<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\ServicePrice;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionApiTest extends TestCase
{
    use RefreshDatabase;

    private function authHeaderFor(User $user): array
    {
        $token = $user->createToken('test-token')->plainTextToken;
        return ['Authorization' => 'Bearer '.$token];
    }

    public function test_transaction_endpoints_require_auth(): void
    {
        $this->getJson('/api/transactions')->assertUnauthorized();
        $this->postJson('/api/transactions', [])->assertUnauthorized();
    }

    public function test_transaction_create_computes_amount_server_side(): void
    {
        $user = User::factory()->create();
        $customer = Customer::factory()->create();
        $service = ServicePrice::factory()->create(['price' => 12000]);

        $response = $this->withHeaders($this->authHeaderFor($user))
            ->postJson('/api/transactions', [
                'customer_id' => $customer->id,
                'service_price_id' => $service->id,
                'quantity' => 3,
                'notes' => 'Handle carefully',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.amount', 36000)
            ->assertJsonPath('data.user_id', $user->id);
    }

    public function test_transaction_can_be_listed_viewed_updated_and_deleted(): void
    {
        $user = User::factory()->create();
        $transaction = Transaction::factory()->create([
            'user_id' => $user->id,
            'status' => 'proses',
            'payment_status' => 'belum_lunas',
        ]);

        $headers = $this->authHeaderFor($user);

        $this->withHeaders($headers)
            ->getJson('/api/transactions')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->withHeaders($headers)
            ->getJson('/api/transactions/'.$transaction->id)
            ->assertOk()
            ->assertJsonPath('data.id', $transaction->id);

        $this->withHeaders($headers)
            ->putJson('/api/transactions/'.$transaction->id, [
                'notes' => 'Updated',
                'status' => 'selesai',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'selesai');

        $this->withHeaders($headers)
            ->deleteJson('/api/transactions/'.$transaction->id)
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_status_and_payment_patch_endpoints_work_with_validation(): void
    {
        $user = User::factory()->create();
        $transaction = Transaction::factory()->create(['user_id' => $user->id]);

        $headers = $this->authHeaderFor($user);

        $this->withHeaders($headers)
            ->patchJson('/api/transactions/'.$transaction->id.'/status', [
                'status' => 'diambil',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'diambil');

        $this->withHeaders($headers)
            ->patchJson('/api/transactions/'.$transaction->id.'/payment', [
                'payment_status' => 'lunas',
            ])
            ->assertOk()
            ->assertJsonPath('data.payment_status', 'lunas');

        $this->withHeaders($headers)
            ->patchJson('/api/transactions/'.$transaction->id.'/status', [
                'status' => 'invalid-status',
            ])
            ->assertStatus(422);

        $this->withHeaders($headers)
            ->patchJson('/api/transactions/'.$transaction->id.'/payment', [
                'payment_status' => 'invalid-payment',
            ])
            ->assertStatus(422);
    }
}
