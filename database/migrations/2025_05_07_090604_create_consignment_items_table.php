<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('consignment_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->references('id')->on('products');
            $table->foreignUuid('product_variant_id')->references('id')->on('product_variants');
            $table->integer('cost_price')->default(0);
            $table->integer('exchange_rate')->default(1);
            $table->integer('qty')->default(1);
            $table->integer('qty_sold')->default(0);
            $table->integer('qty_waste')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consignment_items');
    }
};
