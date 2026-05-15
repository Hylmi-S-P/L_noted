<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\IntegrationController;
use App\Http\Controllers\Api\OcrController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ServicePriceController;
use App\Http\Controllers\Api\TransactionController;

Route::get('/health', function (Request $request) {
    return response()->json([
        'success' => true,
        'message' => 'API is healthy.',
        'data' => ['status' => 'ok'],
        'errors' => null,
    ]);
});

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/device-token', [AuthController::class, 'storeDeviceToken']);
    Route::get('/integrations/status', [IntegrationController::class, 'status']);
    Route::post('/integrations/test-notification', [IntegrationController::class, 'testNotification']);

    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('transactions', TransactionController::class);
    Route::apiResource('service-prices', ServicePriceController::class);
    Route::post('transactions/batch-payment', [TransactionController::class, 'batchPayment']);
    Route::patch('transactions/{id}/status', [TransactionController::class, 'updateStatus']);
    Route::patch('transactions/{id}/payment', [TransactionController::class, 'updatePayment']);
    Route::post('ocr/scan', [OcrController::class, 'scan'])->middleware('throttle:ocr');
    Route::get('reports/daily', [ReportController::class, 'daily']);
    Route::get('reports/summary', [ReportController::class, 'summary']);
    Route::get('reports/export', [ReportController::class, 'export']);
});
