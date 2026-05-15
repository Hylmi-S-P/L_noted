<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Transaction\StoreTransactionRequest;
use App\Http\Requests\Transaction\UpdateTransactionPaymentRequest;
use App\Http\Requests\Transaction\UpdateTransactionRequest;
use App\Http\Requests\Transaction\UpdateTransactionStatusRequest;
use App\Models\Transaction;
use App\Models\ServicePrice;
use App\Models\Customer;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    private function normalizeStatus(?string $status): ?string
    {
        if ($status === null) {
            return null;
        }

        return match ($status) {
            'process' => 'proses',
            'done' => 'selesai',
            'taken' => 'diambil',
            default => $status,
        };
    }

    private function normalizePaymentStatus(string|bool|null $payment): ?string
    {
        if ($payment === null) {
            return null;
        }

        if (is_bool($payment)) {
            return $payment ? 'lunas' : 'belum_lunas';
        }

        return match ($payment) {
            'paid' => 'lunas',
            'unpaid' => 'belum_lunas',
            default => $payment,
        };
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'date' => ['nullable', 'date'],
            'status' => ['nullable', 'string', 'in:pending,proses,selesai,diambil,process,done,taken'],
            'customer' => ['nullable', 'string', 'max:255'],
            'payment_status' => ['nullable', 'in:belum_lunas,lunas,paid,unpaid,0,1,true,false'],
        ]);

        $query = Transaction::query()
            ->with(['customer', 'servicePrice', 'user'])
            ->where('user_id', auth()->id());

        if (!empty($validated['date'])) {
            $query->whereDate('created_at', $validated['date']);
        }

        if (!empty($validated['status'])) {
            $query->where('status', $this->normalizeStatus($validated['status']));
        }

        if (!empty($validated['payment_status'])) {
            $query->where('payment_status', $this->normalizePaymentStatus($validated['payment_status']));
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

        $customer = Customer::where(function ($query) {
            $query->where('user_id', auth()->id())->orWhereNull('user_id');
        })->findOrFail($data['customer_id']);

        $service = ServicePrice::where(function ($query) {
            $query->where('user_id', auth()->id())->orWhereNull('user_id');
        })->findOrFail($data['service_price_id']);

        $weightKg = (float) $data['weight_kg'];
        $quantity = (int) ($data['quantity'] ?? max(1, (int) ceil($weightKg)));
        $pricePerKg = (int) ($service->price_per_kg ?? $service->price);
        $amount = (int) ($data['manual_total_price'] ?? round($pricePerKg * $weightKg));

        $transaction = Transaction::create([
            'user_id' => auth()->id(),
            'customer_id' => $customer->id,
            'service_price_id' => $data['service_price_id'],
            'quantity' => $quantity,
            'weight_kg' => $weightKg,
            'service_type' => $service->service_type ?? $service->name,
            'price_per_kg' => $pricePerKg,
            'amount' => $amount,
            'total_price' => $amount,
            'status' => 'proses',
            'payment_status' => 'belum_lunas',
            'notes' => $data['notes'] ?? null,
            'due_date' => $data['due_date'] ?? null,
        ]);

        return $this->successResponse($transaction->load(['customer', 'servicePrice', 'user']), 'Transaction created.', 201);
    }

    public function show($id)
    {
        $transaction = Transaction::with(['customer', 'servicePrice', 'user'])
            ->where('user_id', auth()->id())
            ->findOrFail($id);
        return $this->successResponse($transaction, 'Transaction fetched.');
    }

    public function update(UpdateTransactionRequest $request, $id)
    {
        $txn = Transaction::where('user_id', auth()->id())->findOrFail($id);
        $payload = $request->validated();
        if (array_key_exists('status', $payload)) {
            $payload['status'] = $this->normalizeStatus($payload['status']);
        }
        if (array_key_exists('payment_status', $payload)) {
            $payload['payment_status'] = $this->normalizePaymentStatus($payload['payment_status']);
        }
        $txn->update($payload);
        return $this->successResponse($txn->fresh(['customer', 'servicePrice', 'user']), 'Transaction updated.');
    }

    public function destroy($id)
    {
        $txn = Transaction::where('user_id', auth()->id())->findOrFail($id);
        $txn->delete();
        return $this->successResponse(null, 'Transaction deleted.');
    }

    public function updateStatus(UpdateTransactionStatusRequest $request, $id)
    {
        $txn = Transaction::where('user_id', auth()->id())->findOrFail($id);
        $payload = $request->validated();
        $payload['status'] = $this->normalizeStatus($payload['status']);
        $txn->update($payload);

        if ($txn->status === 'selesai' || $txn->status === 'diambil') {
            app(NotificationService::class)->sendLaundryDoneReminder($txn);
        }

        return $this->successResponse($txn->fresh(['customer', 'servicePrice', 'user']), 'Transaction status updated.');
    }

    public function updatePayment(UpdateTransactionPaymentRequest $request, $id)
    {
        $txn = Transaction::where('user_id', auth()->id())->findOrFail($id);
        $payload = $request->validated();
        $payload['payment_status'] = $this->normalizePaymentStatus($payload['payment_status']);
        $txn->update($payload);

        return $this->successResponse($txn->fresh(['customer', 'servicePrice', 'user']), 'Transaction payment updated.');
    }

    public function batchPayment(Request $request)
    {
        $validated = $request->validate([
            'transaction_ids' => ['required', 'array', 'min:1'],
            'transaction_ids.*' => ['integer', 'distinct'],
            'payment_status' => ['nullable', 'in:lunas,paid,1,true'],
        ]);

        $transactionIds = $validated['transaction_ids'];
        $transactions = Transaction::with(['customer', 'servicePrice', 'user'])
            ->where('user_id', auth()->id())
            ->whereIn('id', $transactionIds)
            ->get();

        if ($transactions->count() !== count($transactionIds)) {
            return $this->errorResponse('Some transactions were not found.', [
                'transaction_ids' => ['One or more transactions do not exist or are not accessible.'],
            ], 422);
        }

        $customerCount = $transactions->pluck('customer_id')->unique()->count();
        if ($customerCount !== 1) {
            return $this->errorResponse('Transactions must belong to one customer.', [
                'transaction_ids' => ['Select transactions from the same customer only.'],
            ], 422);
        }

        $alreadyPaid = $transactions->where('payment_status', 'lunas');
        if ($alreadyPaid->isNotEmpty()) {
            return $this->errorResponse('Only unpaid transactions can be combined.', [
                'transaction_ids' => ['One or more selected transactions are already paid.'],
            ], 422);
        }

        $total = (int) $transactions->sum(fn (Transaction $transaction) => $transaction->total_price ?? $transaction->amount ?? 0);

        Transaction::where('user_id', auth()->id())
            ->whereIn('id', $transactionIds)
            ->update(['payment_status' => 'lunas']);

        $updated = Transaction::with(['customer', 'servicePrice', 'user'])
            ->where('user_id', auth()->id())
            ->whereIn('id', $transactionIds)
            ->get();

        return $this->successResponse([
            'customer_id' => $updated->first()?->customer_id,
            'total_paid' => $total,
            'transaction_count' => $updated->count(),
            'transactions' => $updated,
        ], 'Selected transactions marked as paid.');
    }
}
