<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\ServicePrice;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportApiTest extends TestCase
{
    use RefreshDatabase;

    private function authHeaderFor(User $user): array
    {
        $token = $user->createToken('test-token')->plainTextToken;
        return ['Authorization' => 'Bearer '.$token];
    }

    public function test_reports_require_authentication(): void
    {
        $this->getJson('/api/reports/daily')->assertUnauthorized();
        $this->getJson('/api/reports/summary?from=2026-01-01&to=2026-01-31')->assertUnauthorized();
    }

    public function test_daily_report_returns_revenue_transaction_count_and_unpaid_count(): void
    {
        $user = User::factory()->create();
        $customer = Customer::factory()->create();
        $service = ServicePrice::factory()->create();

        Transaction::factory()->create([
            'user_id' => $user->id,
            'customer_id' => $customer->id,
            'service_price_id' => $service->id,
            'amount' => 50000,
            'payment_status' => 'belum_lunas',
            'created_at' => now(),
        ]);

        Transaction::factory()->create([
            'user_id' => $user->id,
            'customer_id' => $customer->id,
            'service_price_id' => $service->id,
            'amount' => 30000,
            'payment_status' => 'lunas',
            'created_at' => now(),
        ]);

        $this->withHeaders($this->authHeaderFor($user))
            ->getJson('/api/reports/daily')
            ->assertOk()
            ->assertJsonPath('data.total_revenue', 80000)
            ->assertJsonPath('data.transaction_count', 2)
            ->assertJsonPath('data.unpaid_count', 1);
    }

    public function test_summary_report_returns_data_for_date_range(): void
    {
        $user = User::factory()->create();
        $customer = Customer::factory()->create();
        $service = ServicePrice::factory()->create();

        Transaction::factory()->create([
            'user_id' => $user->id,
            'customer_id' => $customer->id,
            'service_price_id' => $service->id,
            'amount' => 40000,
            'payment_status' => 'belum_lunas',
            'created_at' => '2026-05-01 10:00:00',
        ]);

        Transaction::factory()->create([
            'user_id' => $user->id,
            'customer_id' => $customer->id,
            'service_price_id' => $service->id,
            'amount' => 60000,
            'payment_status' => 'lunas',
            'created_at' => '2026-05-03 10:00:00',
        ]);

        $this->withHeaders($this->authHeaderFor($user))
            ->getJson('/api/reports/summary?from=2026-05-01&to=2026-05-03')
            ->assertOk()
            ->assertJsonPath('data.total_revenue', 100000)
            ->assertJsonPath('data.transaction_count', 2)
            ->assertJsonPath('data.unpaid_count', 1);
    }
}
