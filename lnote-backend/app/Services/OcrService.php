<?php

namespace App\Services;

use Google\Cloud\Vision\V1\Feature;
use Google\Cloud\Vision\V1\Image;
use Google\Cloud\Vision\V1\ImageAnnotatorClient;
use Google\Cloud\Vision\V1\AnnotateImageRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\JpegEncoder;

class OcrService
{
    public function processReceiptImage(UploadedFile $file): array
    {
        $savedPath = $this->saveCompressedReceipt($file);
        $absolutePath = Storage::disk('local')->path($savedPath);

        $rawText = $this->extractTextFromVision($absolutePath);
        $parsed = $this->extractTotalPrice($rawText);

        return [
            'receipt_image_path' => $savedPath,
            'raw_text' => $rawText,
            'total_price' => $parsed['total_price'],
            'confidence' => $parsed['confidence'],
        ];
    }

    private function saveCompressedReceipt(UploadedFile $file): string
    {
        $subDir = 'nota/'.now()->format('Y/m');
        $filename = 'ocr_'.now()->timestamp.'_'.bin2hex(random_bytes(4)).'.jpg';
        $path = $subDir.'/'.$filename;

        $manager = new ImageManager(new Driver());
        $image = $manager->decode($file->getPathname());
        $image = $image->scaleDown(width: 1200);

        $encoded = $image->encode(new JpegEncoder(70));
        Storage::disk('local')->put($path, (string) $encoded);

        return $path;
    }

    private function extractTextFromVision(string $absolutePath): string
    {
        $credentialsPath = config('services.google_vision.key_file');

        if (!$credentialsPath || !file_exists($credentialsPath)) {
            Log::warning('Google Vision credential file missing, OCR fallback to empty text.', [
                'key_file' => $credentialsPath,
            ]);
            return '';
        }

        try {
            $client = new ImageAnnotatorClient([
                'credentials' => $credentialsPath,
            ]);

            $imageData = file_get_contents($absolutePath);
            if ($imageData === false) {
                return '';
            }

            $image = (new Image())->setContent($imageData);
            $feature = (new Feature())->setType(Feature\Type::DOCUMENT_TEXT_DETECTION);
            $request = (new AnnotateImageRequest())
                ->setImage($image)
                ->setFeatures([$feature]);

            $response = $client->annotateImage($request);
            $text = $response->getFullTextAnnotation()?->getText() ?? '';

            $client->close();

            return $text;
        } catch (\Throwable $e) {
            Log::error('Vision OCR failed', ['error' => $e->getMessage()]);
            return '';
        }
    }

    private function extractTotalPrice(string $rawText): array
    {
        if (trim($rawText) === '') {
            return [
                'total_price' => null,
                'confidence' => 0.0,
            ];
        }

        $normalized = preg_replace('/[^0-9RpTOTALtotal.,\n ]/u', ' ', $rawText) ?? $rawText;

        preg_match_all('/(?:Rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+|\d{4,})/u', $normalized, $matches);
        $candidates = array_map(function (string $value): int {
            $digits = preg_replace('/\D/', '', $value);
            return (int) $digits;
        }, $matches[1] ?? []);

        if (count($candidates) === 0) {
            return [
                'total_price' => null,
                'confidence' => 0.2,
            ];
        }

        $max = max($candidates);
        return [
            'total_price' => $max > 0 ? $max : null,
            'confidence' => 0.75,
        ];
    }
}
