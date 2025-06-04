<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('description');
            $table->integer('amount');
            $table->uuidMorphs('expensable'); // ✅ for UUID-based polymorphic relation
            $table->date('expense_date');
            $table->string('status')->default('pending');
            $table->timestamps();
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
