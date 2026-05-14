<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerApiTest extends TestCase
{
    use RefreshDatabase;

    private function authHeaderFor(User $user): array
    {
        $token = $user->createToken('test-token')->plainTextToken;
        return ['Authorization' => 'Bearer '.$token];
    }

    public function test_customer_crud_requires_authentication(): void
    {
        $this->getJson('/api/customers')->assertUnauthorized();
        $this->postJson('/api/customers', ['name' => 'A'])->assertUnauthorized();
    }

    public function test_authenticated_user_can_create_and_list_customers(): void
    {
        $user = User::factory()->create();

        $this->withHeaders($this->authHeaderFor($user))
            ->postJson('/api/customers', [
                'name' => 'Budi',
                'phone' => '08123',
                'email' => 'budi@example.com',
                'address' => 'Jl. Mawar',
            ])
            ->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Budi');

        $this->withHeaders($this->authHeaderFor($user))
            ->getJson('/api/customers')
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_customer_validation_is_enforced(): void
    {
        $user = User::factory()->create();

        $this->withHeaders($this->authHeaderFor($user))
            ->postJson('/api/customers', ['phone' => '081'])
            ->assertStatus(422);
    }

    public function test_authenticated_user_can_update_customer(): void
    {
        $user = User::factory()->create();
        $customer = Customer::factory()->create();

        $this->withHeaders($this->authHeaderFor($user))
            ->putJson('/api/customers/'.$customer->id, [
                'name' => 'Updated Name',
                'email' => 'updated@example.com',
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Name');
    }
}
