<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Storage;
use App\Models\Transaction;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    Transaction::query()
        ->whereIn('status', ['diambil', 'taken'])
        ->where('updated_at', '<', now()->subYear())
        ->whereNotNull('receipt_image_path')
        ->chunkById(200, function ($transactions) {
            foreach ($transactions as $txn) {
                Storage::disk('local')->delete($txn->receipt_image_path);
                $txn->update(['receipt_image_path' => null]);
            }
        });
})->dailyAt('02:00')->name('cleanup-old-receipts');
