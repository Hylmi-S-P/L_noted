<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Basic health route for dev verification
Route::get('/api/health', function () {
    return response()->json(['status' => 'ok']);
});
