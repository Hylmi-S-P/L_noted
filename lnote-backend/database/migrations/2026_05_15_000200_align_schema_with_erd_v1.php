<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasColumn('customers', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('id')->constrained()->nullOnDelete();
                $table->index('user_id');
            }

            if (!Schema::hasColumn('customers', 'phone_number')) {
                $table->string('phone_number')->nullable()->after('name');
            }
        });

        if (Schema::hasColumn('customers', 'phone') && Schema::hasColumn('customers', 'phone_number')) {
            DB::table('customers')
                ->whereNull('phone_number')
                ->whereNotNull('phone')
                ->update(['phone_number' => DB::raw('phone')]);
        }

        Schema::table('service_prices', function (Blueprint $table) {
            if (!Schema::hasColumn('service_prices', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('id')->constrained()->nullOnDelete();
                $table->index('user_id');
            }

            if (!Schema::hasColumn('service_prices', 'service_type')) {
                $table->string('service_type')->nullable()->after('name');
            }

            if (!Schema::hasColumn('service_prices', 'price_per_kg')) {
                $table->unsignedBigInteger('price_per_kg')->nullable()->after('price');
            }
        });

        if (Schema::hasColumn('service_prices', 'price') && Schema::hasColumn('service_prices', 'price_per_kg')) {
            DB::table('service_prices')
                ->whereNull('price_per_kg')
                ->where('unit', 'kg')
                ->whereNotNull('price')
                ->update(['price_per_kg' => DB::raw('price')]);
        }

        Schema::table('transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('transactions', 'weight_kg')) {
                $table->decimal('weight_kg', 5, 2)->nullable()->after('service_price_id');
            }

            if (!Schema::hasColumn('transactions', 'service_type')) {
                $table->string('service_type')->nullable()->after('weight_kg');
            }

            if (!Schema::hasColumn('transactions', 'price_per_kg')) {
                $table->unsignedBigInteger('price_per_kg')->nullable()->after('service_type');
            }

            if (!Schema::hasColumn('transactions', 'total_price')) {
                $table->unsignedBigInteger('total_price')->nullable()->after('amount');
            }

            if (!Schema::hasColumn('transactions', 'receipt_image_path')) {
                $table->string('receipt_image_path', 500)->nullable()->after('total_price');
            }

            if (!Schema::hasColumn('transactions', 'ocr_raw_text')) {
                $table->text('ocr_raw_text')->nullable()->after('receipt_image_path');
            }
        });

        if (Schema::hasColumn('transactions', 'amount') && Schema::hasColumn('transactions', 'total_price')) {
            DB::table('transactions')
                ->whereNull('total_price')
                ->whereNotNull('amount')
                ->update(['total_price' => DB::raw('amount')]);
        }
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            if (Schema::hasColumn('transactions', 'ocr_raw_text')) {
                $table->dropColumn('ocr_raw_text');
            }
            if (Schema::hasColumn('transactions', 'receipt_image_path')) {
                $table->dropColumn('receipt_image_path');
            }
            if (Schema::hasColumn('transactions', 'total_price')) {
                $table->dropColumn('total_price');
            }
            if (Schema::hasColumn('transactions', 'price_per_kg')) {
                $table->dropColumn('price_per_kg');
            }
            if (Schema::hasColumn('transactions', 'service_type')) {
                $table->dropColumn('service_type');
            }
            if (Schema::hasColumn('transactions', 'weight_kg')) {
                $table->dropColumn('weight_kg');
            }
        });

        Schema::table('service_prices', function (Blueprint $table) {
            if (Schema::hasColumn('service_prices', 'price_per_kg')) {
                $table->dropColumn('price_per_kg');
            }
            if (Schema::hasColumn('service_prices', 'service_type')) {
                $table->dropColumn('service_type');
            }
            if (Schema::hasColumn('service_prices', 'user_id')) {
                $table->dropConstrainedForeignId('user_id');
            }
        });

        Schema::table('customers', function (Blueprint $table) {
            if (Schema::hasColumn('customers', 'phone_number')) {
                $table->dropColumn('phone_number');
            }
            if (Schema::hasColumn('customers', 'user_id')) {
                $table->dropConstrainedForeignId('user_id');
            }
        });
    }
};
