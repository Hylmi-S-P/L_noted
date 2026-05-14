<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\TransactionController;
use App\Models\ServicePrice;

Route::get('/health', function (Request $request) {
    return response()->json([
        'success' => true,
        'message' => 'API is healthy.',
        'data' => ['status' => 'ok'],
        'errors' => null,
    ]);
});

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('transactions', TransactionController::class);
    Route::patch('transactions/{id}/status', [TransactionController::class, 'updateStatus']);
    Route::patch('transactions/{id}/payment', [TransactionController::class, 'updatePayment']);

    Route::get('service-prices', function () {
        return response()->json([
            'success' => true,
            'message' => 'Service prices fetched.',
            'data' => ServicePrice::all(),
            'errors' => null,
        ]);
    });
});
