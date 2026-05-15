<?php

namespace Tests\Feature;

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

    public function test_daily_and_summary_reports_are_available(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->create([
            'user_id' => $user->id,
            'amount' => 25000,
            'payment_status' => 'belum_lunas',
            'created_at' => now(),
        ]);
        Transaction::factory()->create([
            'user_id' => $user->id,
            'amount' => 15000,
            'payment_status' => 'lunas',
            'created_at' => now(),
        ]);

        $headers = $this->authHeaderFor($user);

        $this->withHeaders($headers)
            ->getJson('/api/reports/daily')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total_transactions', 2)
            ->assertJsonPath('data.total_revenue', 40000)
            ->assertJsonPath('data.paid_revenue', 15000)
            ->assertJsonPath('data.unpaid_total', 25000)
            ->assertJsonPath('data.unpaid_transactions', 1);

        $from = now()->toDateString();
        $to = now()->toDateString();

        $this->withHeaders($headers)
            ->getJson("/api/reports/summary?from={$from}&to={$to}")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total_transactions', 2)
            ->assertJsonPath('data.total_revenue', 40000)
            ->assertJsonPath('data.paid_revenue', 15000)
            ->assertJsonPath('data.unpaid_total', 25000)
            ->assertJsonPath('data.by_day.0.total_transactions', 2);
    }

    public function test_report_export_downloads_csv(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->create([
            'user_id' => $user->id,
            'amount' => 30000,
            'created_at' => now(),
        ]);

        $from = now()->toDateString();
        $to = now()->toDateString();

        $response = $this->withHeaders($this->authHeaderFor($user))
            ->get("/api/reports/export?from={$from}&to={$to}");

        $response->assertOk();
        $this->assertStringContainsString('text/csv', (string) $response->headers->get('content-type'));
    }
}
