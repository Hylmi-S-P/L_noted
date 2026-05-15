<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ServicePrice\StoreServicePriceRequest;
use App\Http\Requests\ServicePrice\UpdateServicePriceRequest;
use App\Models\ServicePrice;

class ServicePriceController extends Controller
{
    public function index()
    {
        $items = ServicePrice::where(function ($query) {
            $query->where('user_id', auth()->id())->orWhereNull('user_id');
        })->latest()->get();

        return $this->successResponse($items, 'Service prices fetched.');
    }

    public function store(StoreServicePriceRequest $request)
    {
        $payload = $request->validated();
        $price = $payload['price_per_kg'] ?? $payload['price'] ?? 0;

        $item = ServicePrice::create([
            ...$payload,
            'name' => $payload['name'] ?? ($payload['service_type'] ?? 'Service'),
            'price' => $price,
            'price_per_kg' => $price,
            'user_id' => auth()->id(),
        ]);

        return $this->successResponse($item, 'Service price created.', 201);
    }

    public function show(int $id)
    {
        $item = ServicePrice::where(function ($query) {
            $query->where('user_id', auth()->id())->orWhereNull('user_id');
        })->findOrFail($id);

        return $this->successResponse($item, 'Service price fetched.');
    }

    public function update(UpdateServicePriceRequest $request, int $id)
    {
        $item = ServicePrice::where(function ($query) {
            $query->where('user_id', auth()->id())->orWhereNull('user_id');
        })->findOrFail($id);

        $payload = $request->validated();
        if (array_key_exists('price_per_kg', $payload) || array_key_exists('price', $payload)) {
            $price = $payload['price_per_kg'] ?? $payload['price'] ?? $item->price_per_kg ?? $item->price;
            $payload['price'] = $price;
            $payload['price_per_kg'] = $price;
        }

        $item->update($payload);

        return $this->successResponse($item->fresh(), 'Service price updated.');
    }

    public function destroy(int $id)
    {
        $item = ServicePrice::where(function ($query) {
            $query->where('user_id', auth()->id())->orWhereNull('user_id');
        })->findOrFail($id);

        if ((int) $item->user_id !== (int) auth()->id() || $item->transactions()->exists()) {
            return $this->errorResponse(
                'Layanan ini sudah dipakai, jadi tidak bisa dihapus.',
                ['service_price' => ['Layanan ini sudah dipakai, jadi tidak bisa dihapus.']],
                422
            );
        }

        $item->delete();

        return $this->successResponse(null, 'Service price deleted.');
    }
}
