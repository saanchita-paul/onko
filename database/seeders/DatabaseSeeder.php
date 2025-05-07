<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Product::factory()
            ->has(ProductAttribute::factory()->count(2))
            ->count(100)
            ->create();

        Customer::factory()
            ->count(100)
            ->create();
    }
}
