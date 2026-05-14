<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', function (Request $request) {
    return response()->json(['status' => 'ok']);
});

// API resource routes for customers and transactions
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\TransactionController;

Route::apiResource('customers', CustomerController::class);
Route::apiResource('transactions', TransactionController::class);

// Simple endpoint for service prices
use App\Models\ServicePrice;
Route::get('service-prices', function () {
    return response()->json(ServicePrice::all());
});
