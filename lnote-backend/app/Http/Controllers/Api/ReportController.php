<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function daily()
    {
        $query = Transaction::query()
            ->where('user_id', auth()->id())
            ->whereDate('created_at', now()->toDateString());

        $summary = [
            'date' => now()->toDateString(),
            'total_revenue' => $this->sumAmount($query),
            'paid_revenue' => $this->sumAmount((clone $query)->where('payment_status', 'lunas')),
            'unpaid_total' => $this->sumAmount((clone $query)->where('payment_status', '!=', 'lunas')),
            'total_transactions' => (int) (clone $query)->count(),
            'unpaid_transactions' => (int) (clone $query)->where('payment_status', '!=', 'lunas')->count(),
        ];

        return $this->successResponse($summary, 'Daily report fetched.');
    }

    public function summary(Request $request)
    {
        $validated = $request->validate([
            'from' => ['required', 'date'],
            'to' => ['required', 'date', 'after_or_equal:from'],
        ]);

        $base = Transaction::query()
            ->where('user_id', auth()->id())
            ->whereDate('created_at', '>=', $validated['from'])
            ->whereDate('created_at', '<=', $validated['to']);

        $rows = (clone $base)
            ->selectRaw('DATE(created_at) as day')
            ->selectRaw('COUNT(*) as total_transactions')
            ->selectRaw('COALESCE(SUM(COALESCE(total_price, amount, 0)), 0) as total_revenue')
            ->selectRaw("COALESCE(SUM(CASE WHEN payment_status = 'lunas' THEN COALESCE(total_price, amount, 0) ELSE 0 END), 0) as paid_revenue")
            ->selectRaw("COALESCE(SUM(CASE WHEN payment_status != 'lunas' THEN COALESCE(total_price, amount, 0) ELSE 0 END), 0) as unpaid_total")
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(fn ($row) => [
                'day' => $row->day,
                'total_transactions' => (int) $row->total_transactions,
                'total_revenue' => (int) $row->total_revenue,
                'paid_revenue' => (int) $row->paid_revenue,
                'unpaid_total' => (int) $row->unpaid_total,
            ]);

        $summary = [
            'from' => $validated['from'],
            'to' => $validated['to'],
            'total_revenue' => $this->sumAmount($base),
            'paid_revenue' => $this->sumAmount((clone $base)->where('payment_status', 'lunas')),
            'unpaid_total' => $this->sumAmount((clone $base)->where('payment_status', '!=', 'lunas')),
            'total_transactions' => (int) (clone $base)->count(),
            'unpaid_transactions' => (int) (clone $base)->where('payment_status', '!=', 'lunas')->count(),
            'by_day' => $rows,
        ];

        return $this->successResponse($summary, 'Summary report fetched.');
    }

    public function export(Request $request): StreamedResponse
    {
        $validated = $request->validate([
            'from' => ['required', 'date'],
            'to' => ['required', 'date', 'after_or_equal:from'],
        ]);

        $filename = sprintf('report_%s_%s.csv', $validated['from'], $validated['to']);
        $transactions = Transaction::with(['customer', 'servicePrice'])
            ->where('user_id', auth()->id())
            ->whereDate('created_at', '>=', $validated['from'])
            ->whereDate('created_at', '<=', $validated['to'])
            ->orderBy('created_at')
            ->get();

        return response()->streamDownload(function () use ($transactions) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'id',
                'date',
                'customer',
                'service_type',
                'weight_kg',
                'total_price',
                'payment_status',
                'notes',
            ]);

            foreach ($transactions as $txn) {
                fputcsv($handle, [
                    $txn->id,
                    $txn->created_at?->toDateString(),
                    $txn->customer?->name,
                    $txn->service_type ?? $txn->servicePrice?->service_type ?? $txn->servicePrice?->name,
                    $txn->weight_kg ?? $txn->quantity,
                    $txn->total_price ?? $txn->amount,
                    $txn->payment_status,
                    $txn->notes,
                ]);
            }
            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    private function sumAmount(Builder $query): int
    {
        return (int) (clone $query)
            ->selectRaw('COALESCE(SUM(COALESCE(total_price, amount, 0)), 0) as aggregate')
            ->value('aggregate');
    }
}
