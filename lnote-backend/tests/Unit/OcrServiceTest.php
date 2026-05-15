<?php

namespace Tests\Unit;

use App\Services\OcrService;
use Tests\TestCase;

class OcrServiceTest extends TestCase
{
    public function test_it_extracts_total_price_from_raw_text(): void
    {
        $service = new OcrService();
        $reflection = new \ReflectionClass($service);
        $method = $reflection->getMethod('extractTotalPrice');
        $method->setAccessible(true);

        $text = "Laundry\nTotal: Rp 45.000\nTerima kasih";
        $result = $method->invoke($service, $text);

        $this->assertEquals(45000, $result);
    }

    public function test_it_extracts_total_when_amount_is_on_next_line(): void
    {
        $service = new OcrService();
        $reflection = new \ReflectionClass($service);
        $method = $reflection->getMethod('extractTotalPrice');
        $method->setAccessible(true);

        $text = "Tanggal: 02-04-26\nHarga 8.000\nTOTAL\n26.000\nDP\nSISA";
        $result = $method->invoke($service, $text);

        $this->assertEquals(26000, $result);
    }

    public function test_it_ignores_dates_when_using_fallback_amounts(): void
    {
        $service = new OcrService();
        $reflection = new \ReflectionClass($service);
        $method = $reflection->getMethod('extractTotalPrice');
        $method->setAccessible(true);

        $text = "Tanggal: 02-04-26\nCuci Setrika 1,7\nHarga 8-000";
        $result = $method->invoke($service, $text);

        $this->assertEquals(8000, $result);
    }
}
