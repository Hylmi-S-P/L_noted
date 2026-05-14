<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function daily(Request $request)
    {
        $today = now()->toDateString();
        $baseQuery = Transaction::query()
            ->where('user_id', auth()->id())
            ->whereDate('created_at', $today);

        $totalRevenue = (int) $baseQuery->sum('amount');
        $transactionCount = (int) (clone $baseQuery)->count();
        $unpaidCount = (int) (clone $baseQuery)->where('payment_status', 'belum_lunas')->count();

        return $this->successResponse([
            'date' => $today,
            'total_revenue' => $totalRevenue,
            'transaction_count' => $transactionCount,
            'unpaid_count' => $unpaidCount,
        ], 'Daily report fetched.');
    }

    public function summary(Request $request)
    {
        $validated = $request->validate([
            'from' => ['required', 'date'],
            'to' => ['required', 'date', 'after_or_equal:from'],
        ]);

        $baseQuery = Transaction::query()
            ->where('user_id', auth()->id())
            ->whereDate('created_at', '>=', $validated['from'])
            ->whereDate('created_at', '<=', $validated['to']);

        $totalRevenue = (int) $baseQuery->sum('amount');
        $transactionCount = (int) (clone $baseQuery)->count();
        $unpaidCount = (int) (clone $baseQuery)->where('payment_status', 'belum_lunas')->count();

        return $this->successResponse([
            'from' => $validated['from'],
            'to' => $validated['to'],
            'total_revenue' => $totalRevenue,
            'transaction_count' => $transactionCount,
            'unpaid_count' => $unpaidCount,
        ], 'Summary report fetched.');
    }
}
