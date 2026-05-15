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
        $service = ServicePrice::factory()->create(['price' => 12000, 'price_per_kg' => 12000]);

        $response = $this->withHeaders($this->authHeaderFor($user))
            ->postJson('/api/transactions', [
                'customer_id' => $customer->id,
                'service_price_id' => $service->id,
                'weight_kg' => '1,5',
                'notes' => 'Handle carefully',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.amount', 18000)
            ->assertJsonPath('data.total_price', 18000)
            ->assertJsonPath('data.weight_kg', 1.5)
            ->assertJsonPath('data.user_id', $user->id);
    }

    public function test_transaction_create_can_use_manual_total_price(): void
    {
        $user = User::factory()->create();
        $customer = Customer::factory()->create();
        $service = ServicePrice::factory()->create(['price' => 12000, 'price_per_kg' => 12000]);

        $response = $this->withHeaders($this->authHeaderFor($user))
            ->postJson('/api/transactions', [
                'customer_id' => $customer->id,
                'service_price_id' => $service->id,
                'weight_kg' => 1.5,
                'manual_total_price' => 26000,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.amount', 26000)
            ->assertJsonPath('data.total_price', 26000)
            ->assertJsonPath('data.weight_kg', 1.5)
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

    public function test_batch_payment_marks_same_customer_unpaid_transactions_paid(): void
    {
        $user = User::factory()->create();
        $customer = Customer::factory()->create();
        $first = Transaction::factory()->create([
            'user_id' => $user->id,
            'customer_id' => $customer->id,
            'payment_status' => 'belum_lunas',
            'amount' => 12000,
            'total_price' => 12000,
        ]);
        $second = Transaction::factory()->create([
            'user_id' => $user->id,
            'customer_id' => $customer->id,
            'payment_status' => 'belum_lunas',
            'amount' => 18000,
            'total_price' => 18000,
        ]);

        $this->withHeaders($this->authHeaderFor($user))
            ->postJson('/api/transactions/batch-payment', [
                'transaction_ids' => [$first->id, $second->id],
                'payment_status' => 'lunas',
            ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total_paid', 30000)
            ->assertJsonPath('data.transaction_count', 2);

        $this->assertDatabaseHas('transactions', [
            'id' => $first->id,
            'payment_status' => 'lunas',
        ]);
        $this->assertDatabaseHas('transactions', [
            'id' => $second->id,
            'payment_status' => 'lunas',
        ]);
    }

    public function test_batch_payment_rejects_different_customers(): void
    {
        $user = User::factory()->create();
        $first = Transaction::factory()->create([
            'user_id' => $user->id,
            'payment_status' => 'belum_lunas',
        ]);
        $second = Transaction::factory()->create([
            'user_id' => $user->id,
            'payment_status' => 'belum_lunas',
        ]);

        $this->withHeaders($this->authHeaderFor($user))
            ->postJson('/api/transactions/batch-payment', [
                'transaction_ids' => [$first->id, $second->id],
                'payment_status' => 'lunas',
            ])
            ->assertStatus(422);
    }
}
