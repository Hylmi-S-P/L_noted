<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Transaction\StoreTransactionRequest;
use App\Http\Requests\Transaction\UpdateTransactionPaymentRequest;
use App\Http\Requests\Transaction\UpdateTransactionRequest;
use App\Http\Requests\Transaction\UpdateTransactionStatusRequest;
use App\Models\Transaction;
use App\Models\ServicePrice;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'date' => ['nullable', 'date'],
            'status' => ['nullable', 'string', 'in:pending,proses,selesai,diambil'],
            'customer' => ['nullable', 'string', 'max:255'],
            'payment_status' => ['nullable', 'string', 'in:belum_lunas,lunas'],
        ]);

        $query = Transaction::query()
            ->with(['customer', 'servicePrice', 'user'])
            ->where('user_id', auth()->id());

        if (!empty($validated['date'])) {
            $query->whereDate('created_at', $validated['date']);
        }

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (!empty($validated['payment_status'])) {
            $query->where('payment_status', $validated['payment_status']);
        }

        if (!empty($validated['customer'])) {
            $search = $validated['customer'];
            $query->whereHas('customer', function ($subQuery) use ($search) {
                $subQuery->where('name', 'like', '%'.$search.'%');
            });
        }

        $transactions = $query->latest()->get();
        return $this->successResponse($transactions, 'Transactions fetched.');
    }

    public function store(StoreTransactionRequest $request)
    {
        $data = $request->validated();

        $service = ServicePrice::findOrFail($data['service_price_id']);
        $amount = (int) ($service->price * $data['quantity']);

        $transaction = Transaction::create([
            'user_id' => auth()->id(),
            'customer_id' => $data['customer_id'],
            'service_price_id' => $data['service_price_id'],
            'quantity' => $data['quantity'],
            'amount' => $amount,
            'status' => 'proses',
            'payment_status' => 'belum_lunas',
            'notes' => $data['notes'] ?? null,
            'due_date' => $data['due_date'] ?? null,
        ]);

        return $this->successResponse($transaction->load(['customer', 'servicePrice', 'user']), 'Transaction created.', 201);
    }

    public function show($id)
    {
        $transaction = Transaction::with(['customer', 'servicePrice', 'user'])->findOrFail($id);
        return $this->successResponse($transaction, 'Transaction fetched.');
    }

    public function update(UpdateTransactionRequest $request, $id)
    {
        $txn = Transaction::findOrFail($id);
        $txn->update($request->validated());
        return $this->successResponse($txn->fresh(['customer', 'servicePrice', 'user']), 'Transaction updated.');
    }

    public function destroy($id)
    {
        $txn = Transaction::findOrFail($id);
        $txn->delete();
        return $this->successResponse(null, 'Transaction deleted.');
    }

    public function updateStatus(UpdateTransactionStatusRequest $request, $id)
    {
        $txn = Transaction::findOrFail($id);
        $txn->update($request->validated());

        return $this->successResponse($txn->fresh(['customer', 'servicePrice', 'user']), 'Transaction status updated.');
    }

    public function updatePayment(UpdateTransactionPaymentRequest $request, $id)
    {
        $txn = Transaction::findOrFail($id);
        $txn->update($request->validated());

        return $this->successResponse($txn->fresh(['customer', 'servicePrice', 'user']), 'Transaction payment updated.');
    }
}
