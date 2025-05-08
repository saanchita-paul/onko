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
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('customer_id')->references('id')->on('customers')->nullable();
            $table->integer('sub_total');
            $table->integer('discount_total')->default(0);
            $table->integer('tax_total')->default(0);
            $table->integer('grand_total')->default(0);
            $table->integer('payment_total')->default(0);
            $table->string('status')->default('created');
            $table->json('meta')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
