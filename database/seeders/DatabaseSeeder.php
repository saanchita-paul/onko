<?php

namespace Database\Seeders;

use App\Models\Consignment;
use App\Models\Customer;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        Consignment::factory()
            ->count(15)
            ->create();

        Customer::factory()
            ->count(100)
            ->create();
    }
}
