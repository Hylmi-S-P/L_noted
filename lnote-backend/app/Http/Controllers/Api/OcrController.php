<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OcrService;
use Illuminate\Http\Request;

class OcrController extends Controller
{
    public function __construct(private readonly OcrService $ocrService)
    {
    }

    public function scan(Request $request)
    {
        $validated = $request->validate([
            'image' => ['required', 'image', 'max:5120'],
        ]);

        $result = $this->ocrService->processReceipt($validated['image']);

        return $this->successResponse($result, 'OCR scan processed.');
    }
}
