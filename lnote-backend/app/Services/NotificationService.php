<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    private const OAUTH_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
    private const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

    public function sendTestNotification(User $user): array
    {
        $deviceToken = $user->fcm_device_token;

        if (empty($deviceToken)) {
            return [
                'success' => false,
                'reason' => 'missing_device_token',
            ];
        }

        $accessToken = $this->getAccessToken();
        $projectId = $this->getFcmProjectId();
        if (empty($accessToken) || empty($projectId)) {
            return [
                'success' => false,
                'reason' => 'missing_fcm_v1_configuration',
            ];
        }

        $response = Http::timeout(10)
            ->withHeaders([
                'Authorization' => 'Bearer '.$accessToken,
                'Content-Type' => 'application/json',
            ])
            ->post('https://fcm.googleapis.com/v1/projects/'.$projectId.'/messages:send', [
                'message' => [
                    'token' => $deviceToken,
                    'notification' => [
                        'title' => 'L-Note Test Notification',
                        'body' => 'FCM integration is working.',
                    ],
                    'data' => [
                        'kind' => 'integration_test',
                    ],
                ],
            ]);

        if (!$response->successful()) {
            return [
                'success' => false,
                'reason' => 'fcm_http_error',
                'status' => $response->status(),
                'body' => $response->body(),
            ];
        }

        return [
            'success' => true,
            'status' => $response->status(),
            'body' => $response->json(),
        ];
    }

    public function sendLaundryDoneReminder(Transaction $transaction): void
    {
        $user = $transaction->user;
        $deviceToken = $user?->fcm_device_token;
        $accessToken = $this->getAccessToken();
        $projectId = $this->getFcmProjectId();

        if (empty($deviceToken) || empty($accessToken) || empty($projectId)) {
            Log::info('Reminder skipped due to missing FCM configuration/token', [
                'transaction_id' => $transaction->id,
                'user_id' => $transaction->user_id,
                'has_device_token' => !empty($deviceToken),
                'has_access_token' => !empty($accessToken),
                'has_project_id' => !empty($projectId),
            ]);
            return;
        }

        $title = 'Laundry Update';
        $body = 'Transaksi #'.$transaction->id.' sudah selesai diproses.';

        $response = Http::timeout(10)
            ->withHeaders([
                'Authorization' => 'Bearer '.$accessToken,
                'Content-Type' => 'application/json',
            ])
            ->post('https://fcm.googleapis.com/v1/projects/'.$projectId.'/messages:send', [
                'message' => [
                    'token' => $deviceToken,
                    'notification' => [
                        'title' => $title,
                        'body' => $body,
                    ],
                    'data' => [
                        'transaction_id' => (string) $transaction->id,
                        'status' => (string) $transaction->status,
                    ],
                ],
            ]);

        if (!$response->successful()) {
            Log::warning('FCM reminder failed', [
                'transaction_id' => $transaction->id,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return;
        }

        Log::info('Laundry done reminder sent', [
            'transaction_id' => $transaction->id,
            'user_id' => $transaction->user_id,
            'customer_id' => $transaction->customer_id,
            'status' => $transaction->status,
        ]);
    }

    private function getFcmProjectId(): ?string
    {
        $projectId = config('services.fcm.project_id');
        if (!empty($projectId)) {
            return $projectId;
        }

        $serviceAccount = $this->getServiceAccountFromConfig();
        return $serviceAccount['project_id'] ?? null;
    }

    private function getAccessToken(): ?string
    {
        return Cache::remember('fcm_v1_access_token', 3000, function () {
            $serviceAccount = $this->getServiceAccountFromConfig();
            if (empty($serviceAccount)) {
                return null;
            }

            $clientEmail = $serviceAccount['client_email'] ?? config('services.fcm.client_email');
            $privateKey = $serviceAccount['private_key'] ?? config('services.fcm.private_key');
            if (empty($clientEmail) || empty($privateKey)) {
                return null;
            }

            $privateKey = str_replace('\n', "\n", $privateKey);
            $now = time();

            $header = $this->base64UrlEncode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
            $claims = $this->base64UrlEncode(json_encode([
                'iss' => $clientEmail,
                'scope' => self::OAUTH_SCOPE,
                'aud' => self::TOKEN_ENDPOINT,
                'iat' => $now,
                'exp' => $now + 3600,
            ]));

            $unsignedJwt = $header.'.'.$claims;
            $signature = '';
            $signOk = openssl_sign($unsignedJwt, $signature, $privateKey, OPENSSL_ALGO_SHA256);
            if (!$signOk) {
                return null;
            }

            $jwt = $unsignedJwt.'.'.$this->base64UrlEncode($signature);

            $response = Http::asForm()->timeout(10)->post(self::TOKEN_ENDPOINT, [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt,
            ]);

            if (!$response->successful()) {
                Log::warning('FCM OAuth token fetch failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return null;
            }

            return $response->json('access_token');
        });
    }

    private function getServiceAccountFromConfig(): ?array
    {
        $jsonSource = config('services.fcm.service_account_json');
        if (empty($jsonSource)) {
            return null;
        }

        if (is_string($jsonSource) && str_starts_with(trim($jsonSource), '{')) {
            $decoded = json_decode($jsonSource, true);
            return is_array($decoded) ? $decoded : null;
        }

        if (is_string($jsonSource) && is_file($jsonSource)) {
            $raw = file_get_contents($jsonSource);
            $decoded = json_decode($raw ?: '', true);
            return is_array($decoded) ? $decoded : null;
        }

        return null;
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
