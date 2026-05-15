<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\StoreDeviceTokenRequest;
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

    public function storeDeviceToken(StoreDeviceTokenRequest $request)
    {
        $user = auth()->user();
        $user->update([
            'fcm_device_token' => $request->validated('device_token'),
        ]);

        return $this->successResponse(null, 'Device token saved.');
    }
}
