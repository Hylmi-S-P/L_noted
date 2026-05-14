<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return $this->errorResponse('Invalid credentials.', ['email' => ['Invalid email or password.']], 422);
        }

        $token = $user->createToken('mobile-token')->plainTextToken;

        return $this->successResponse([
            'token' => $token,
            'user' => $user,
        ], 'Login successful.');
    }

    public function me()
    {
        return $this->successResponse(auth()->user(), 'Current user profile.');
    }

    public function logout()
    {
        $user = auth()->user();
        $user?->currentAccessToken()?->delete();

        return $this->successResponse(null, 'Logout successful.');
    }
}
