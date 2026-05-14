<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\ServicePrice;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionFilterApiTest extends TestCase
{
    use RefreshDatabase;

    private function authHeaderFor(User $user): array
    {
        $token = $user->createToken('test-token')->plainTextToken;
        return ['Authorization' => 'Bearer '.$token];
    }

    public function test_transaction_list_is_scoped_to_authenticated_user(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        Transaction::factory()->create(['user_id' => $userA->id]);
        Transaction::factory()->create(['user_id' => $userB->id]);

        $response = $this->withHeaders($this->authHeaderFor($userA))->getJson('/api/transactions');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals($userA->id, $response->json('data.0.user_id'));
    }

    public function test_transaction_filters_by_date_status_customer_and_payment(): void
    {
        $user = User::factory()->create();
        $service = ServicePrice::factory()->create();
        $customerA = Customer::factory()->create(['name' => 'Siti Aminah']);
        $customerB = Customer::factory()->create(['name' => 'Budi Santoso']);

        Transaction::factory()->create([
            'user_id' => $user->id,
            'customer_id' => $customerA->id,
            'service_price_id' => $service->id,
            'status' => 'proses',
            'payment_status' => 'belum_lunas',
            'created_at' => '2026-05-15 10:00:00',
        ]);

        Transaction::factory()->create([
            'user_id' => $user->id,
            'customer_id' => $customerB->id,
            'service_price_id' => $service->id,
            'status' => 'selesai',
            'payment_status' => 'lunas',
            'created_at' => '2026-05-16 10:00:00',
        ]);

        $headers = $this->authHeaderFor($user);

        $this->withHeaders($headers)
            ->getJson('/api/transactions?status=proses')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'proses');

        $this->withHeaders($headers)
            ->getJson('/api/transactions?payment_status=lunas')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.payment_status', 'lunas');

        $this->withHeaders($headers)
            ->getJson('/api/transactions?date=2026-05-16')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'selesai');

        $this->withHeaders($headers)
            ->getJson('/api/transactions?customer=Siti')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.customer.name', 'Siti Aminah');
    }
}
