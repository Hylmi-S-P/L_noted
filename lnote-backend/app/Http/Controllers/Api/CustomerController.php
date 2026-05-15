<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreCustomerRequest;
use App\Http\Requests\Customer\UpdateCustomerRequest;
use App\Models\Customer;

class CustomerController extends Controller
{
    public function index()
    {
        return $this->successResponse(
            Customer::where(function ($query) {
                $query->where('user_id', auth()->id())->orWhereNull('user_id');
            })->latest()->get(),
            'Customers fetched.'
        );
    }

    public function store(StoreCustomerRequest $request)
    {
        $payload = $request->validated();
        if (!isset($payload['phone_number']) && !empty($payload['phone'])) {
            $payload['phone_number'] = $payload['phone'];
        }

        $customer = Customer::create([
            ...$payload,
            'user_id' => auth()->id(),
        ]);
        return $this->successResponse($customer, 'Customer created.', 201);
    }

    public function show($id)
    {
        $customer = Customer::where(function ($query) {
            $query->where('user_id', auth()->id())->orWhereNull('user_id');
        })->findOrFail($id);
        return $this->successResponse($customer, 'Customer fetched.');
    }

    public function update(UpdateCustomerRequest $request, $id)
    {
        $customer = Customer::where(function ($query) {
            $query->where('user_id', auth()->id())->orWhereNull('user_id');
        })->findOrFail($id);
        $payload = $request->validated();
        if (!isset($payload['phone_number']) && !empty($payload['phone'])) {
            $payload['phone_number'] = $payload['phone'];
        }
        $customer->update($payload);
        return $this->successResponse($customer->fresh(), 'Customer updated.');
    }

    public function destroy($id)
    {
        $customer = Customer::where(function ($query) {
            $query->where('user_id', auth()->id())->orWhereNull('user_id');
        })->findOrFail($id);

        if ($customer->transactions()->exists()) {
            return $this->errorResponse(
                'Pelanggan ini sudah punya transaksi, jadi tidak bisa dihapus.',
                ['customer' => ['Pelanggan ini sudah punya transaksi, jadi tidak bisa dihapus.']],
                422
            );
        }

        if ((int) $customer->user_id !== (int) auth()->id()) {
            return $this->errorResponse(
                'Pelanggan bawaan sistem tidak bisa dihapus.',
                ['customer' => ['Pelanggan bawaan sistem tidak bisa dihapus.']],
                422
            );
        }

        $customer->delete();
        return $this->successResponse(null, 'Customer deleted.');
    }
}
