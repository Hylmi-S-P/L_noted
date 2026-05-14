<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ocr\OcrScanRequest;
use App\Services\OcrService;

class OcrController extends Controller
{
    public function __construct(private readonly OcrService $ocrService)
    {
    }

    public function scan(OcrScanRequest $request)
    {
        $result = $this->ocrService->processReceiptImage($request->file('receipt_image'));

        return $this->successResponse($result, 'OCR scan processed.');
    }
}
