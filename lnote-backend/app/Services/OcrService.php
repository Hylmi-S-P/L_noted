<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OcrService
{
    public function providerStatus(): array
    {
        $apiKey = config('services.google_vision.api_key');

        if (empty($apiKey)) {
            return [
                'configured' => false,
                'ready' => false,
                'status' => 'not_configured',
                'error_code' => null,
                'error_message' => null,
            ];
        }

        try {
            $response = Http::timeout(10)->post(
                'https://vision.googleapis.com/v1/images:annotate?key='.$apiKey,
                [
                    'requests' => [[
                        'image' => [
                            'content' => base64_encode(
                                base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')
                            ),
                        ],
                        'features' => [[
                            'type' => 'TEXT_DETECTION',
                            'maxResults' => 1,
                        ]],
                    ]],
                ]
            );

            if ($response->successful()) {
                return [
                    'configured' => true,
                    'ready' => true,
                    'status' => 'ok',
                    'error_code' => null,
                    'error_message' => null,
                ];
            }

            $error = $response->json('error') ?? [];

            return [
                'configured' => true,
                'ready' => false,
                'status' => 'error',
                'error_code' => $error['details'][0]['reason'] ?? $error['status'] ?? 'GOOGLE_VISION_ERROR',
                'error_message' => $error['message'] ?? 'Google Vision readiness check failed.',
            ];
        } catch (\Throwable $e) {
            return [
                'configured' => true,
                'ready' => false,
                'status' => 'error',
                'error_code' => 'GOOGLE_VISION_EXCEPTION',
                'error_message' => $e->getMessage(),
            ];
        }
    }

    public function processReceipt(UploadedFile $file): array
    {
        $directory = 'nota/'.now()->format('Y/m');
        $filename = 'ocr_'.time().'_'.Str::random(8).'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs($directory, $filename, 'local');

        $rawText = null;
        $confidence = 0.0;
        $totalPrice = null;
        $providerStatus = 'not_configured';
        $providerErrorCode = null;
        $providerErrorMessage = null;

        $apiKey = config('services.google_vision.api_key');
        if (!empty($apiKey)) {
            $providerStatus = 'configured';

            try {
                $rawBytes = Storage::disk('local')->get($path);
                $base64Image = base64_encode($rawBytes);

                $response = Http::timeout(20)->post(
                    'https://vision.googleapis.com/v1/images:annotate?key='.$apiKey,
                    [
                        'requests' => [[
                            'image' => ['content' => $base64Image],
                            'features' => [[
                                'type' => 'DOCUMENT_TEXT_DETECTION',
                            ]],
                        ]],
                    ]
                );

                if ($response->successful()) {
                    $providerStatus = 'ok';
                    $payload = $response->json();
                    $annotation = $payload['responses'][0]['fullTextAnnotation'] ?? null;
                    $rawText = $annotation['text'] ?? null;
                    $confidence = (float) ($payload['responses'][0]['textAnnotations'][0]['confidence'] ?? 0);
                    $totalPrice = $this->extractTotalPrice($rawText);
                } else {
                    $providerStatus = 'error';
                    $errorPayload = $response->json('error') ?? [];
                    $providerErrorCode = $errorPayload['details'][0]['reason']
                        ?? $errorPayload['status']
                        ?? 'GOOGLE_VISION_ERROR';
                    $providerErrorMessage = $errorPayload['message'] ?? 'Google Vision request failed.';

                    Log::warning('Google Vision request failed', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::warning('Google Vision processing error', [
                    'message' => $e->getMessage(),
                ]);

                $providerStatus = 'error';
                $providerErrorCode = 'GOOGLE_VISION_EXCEPTION';
                $providerErrorMessage = $e->getMessage();
            }
        }

        return [
            'total_price' => $totalPrice,
            'raw_text' => $rawText,
            'confidence' => $confidence,
            'receipt_image_path' => $path,
            'provider_status' => $providerStatus,
            'provider_error_code' => $providerErrorCode,
            'provider_error_message' => $providerErrorMessage,
        ];
    }

    private function extractTotalPrice(?string $rawText): ?int
    {
        if (empty($rawText)) {
            return null;
        }

        $normalizedText = $this->removeDateLikeNumbers($rawText);
        $keywordCandidates = $this->amountsNearKeywords($normalizedText, ['total', 'jumlah', 'tagihan']);

        if (!empty($keywordCandidates)) {
            return max($keywordCandidates);
        }

        $fallback = $this->extractAmounts($normalizedText);

        return empty($fallback) ? null : max($fallback);
    }

    /**
     * Thermal receipt OCR often reads prices as "8.000", "8-000", or "8 000".
     */
    private function extractAmounts(string $text): array
    {
        preg_match_all('/(?:rp\s*)?\d{1,3}(?:[\.\,\-\s]\d{3})+|\b\d{4,8}\b/iu', $text, $matches);

        $amounts = [];
        foreach ($matches[0] as $rawNumber) {
            $number = (int) preg_replace('/[^\d]/', '', $rawNumber);
            if ($number >= 1000 && $number <= 100000000) {
                $amounts[] = $number;
            }
        }

        return $amounts;
    }

    private function amountsNearKeywords(string $text, array $keywords): array
    {
        $candidates = [];
        $lower = mb_strtolower($text);

        foreach ($keywords as $keyword) {
            $offset = 0;
            while (($position = mb_strpos($lower, $keyword, $offset)) !== false) {
                $window = mb_substr($text, max(0, $position - 24), 96);
                $candidates = array_merge($candidates, $this->extractAmounts($window));
                $offset = $position + mb_strlen($keyword);
            }
        }

        return $candidates;
    }

    private function removeDateLikeNumbers(string $text): string
    {
        return preg_replace('/\b\d{1,2}\s*[\-\/\.]\s*\d{1,2}\s*[\-\/\.]\s*\d{2,4}\b/', ' ', $text) ?? $text;
    }
}
