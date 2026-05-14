<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\ServicePrice;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index()
    {
        return response()->json(Transaction::with(['customer','servicePrice','user'])->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_id' => 'required|integer|exists:customers,id',
            'service_price_id' => 'required|integer|exists:service_prices,id',
            'quantity' => 'required|numeric|min:0.1',
            'notes' => 'nullable|string',
        ]);

        // Compute amount server-side to avoid manipulation from client
        $service = ServicePrice::findOrFail($data['service_price_id']);
        // For simplicity: assume price is per unit (kg or unit). Quantity multiplies price.
        $amount = (int) round($service->price * $data['quantity']);

        $transaction = Transaction::create([
            'user_id' => auth()->id() ?? 1,
            'customer_id' => $data['customer_id'],
            'service_price_id' => $data['service_price_id'],
            'quantity' => $data['quantity'],
            'amount' => $amount,
            'status' => 'proses',
            'payment_status' => 'belum_lunas',
            'notes' => $data['notes'] ?? null,
        ]);

        return response()->json($transaction->load(['customer','servicePrice']), 201);
    }

    public function show($id)
    {
        return response()->json(Transaction::with(['customer','servicePrice','user'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $txn = Transaction::findOrFail($id);
        $data = $request->validate([
            'status' => 'nullable|string',
            'payment_status' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $txn->update($data);
        return response()->json($txn);
    }

    public function destroy($id)
    {
        $txn = Transaction::findOrFail($id);
        $txn->delete();
        return response()->json(null, 204);
    }
}
