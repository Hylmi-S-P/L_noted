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
        return $this->successResponse(Customer::latest()->get(), 'Customers fetched.');
    }

    public function store(StoreCustomerRequest $request)
    {
        $customer = Customer::create($request->validated());
        return $this->successResponse($customer, 'Customer created.', 201);
    }

    public function show($id)
    {
        return $this->successResponse(Customer::findOrFail($id), 'Customer fetched.');
    }

    public function update(UpdateCustomerRequest $request, $id)
    {
        $customer = Customer::findOrFail($id);
        $customer->update($request->validated());
        return $this->successResponse($customer->fresh(), 'Customer updated.');
    }

    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);
        $customer->delete();
        return $this->successResponse(null, 'Customer deleted.');
    }
}
