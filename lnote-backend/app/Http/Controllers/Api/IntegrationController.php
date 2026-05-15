<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\NotificationService;
use App\Services\OcrService;

class IntegrationController extends Controller
{
    public function status(OcrService $ocrService)
    {
        $vision = $ocrService->providerStatus();

        return $this->successResponse([
            'google_vision_configured' => $vision['configured'],
            'google_vision_ready' => $vision['ready'],
            'google_vision_status' => $vision['status'],
            'google_vision_error_code' => $vision['error_code'],
            'google_vision_error_message' => $vision['error_message'],
            'fcm_configured' => !empty(config('services.fcm.service_account_json')) || !empty(config('services.fcm.client_email')),
            'device_token_saved' => !empty(auth()->user()?->fcm_device_token),
        ], 'Integration status fetched.');
    }

    public function testNotification(NotificationService $notificationService)
    {
        $result = $notificationService->sendTestNotification(auth()->user());

        if (!$result['success']) {
            return $this->errorResponse('Test notification failed.', $result, 422);
        }

        return $this->successResponse($result, 'Test notification sent.');
    }
}
