<?php

namespace App\Http\Controllers;

abstract class Controller
{
    protected function successResponse(mixed $data = null, string $message = 'OK', int $status = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'errors' => null,
        ], $status);
    }

    protected function errorResponse(string $message = 'Error', mixed $errors = null, int $status = 400)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data' => null,
            'errors' => $errors,
        ], $status);
    }
}
