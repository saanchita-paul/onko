<?php

use App\Http\Controllers\ConsignmentController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\OptionController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SalesController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::get('/orders/create', [OrderController::class, 'create'])->name('orders.create');
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::post('/employees', [EmployeeController::class, 'store'])->name('employees.store');
    Route::get('/consignments', [ConsignmentController::class, 'index'])->name('consignments.index');
    Route::get('/sales', [SalesController::class, 'index'])->name('sales.index');
    Route::post('/customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::post('/options', [OptionController::class, 'store'])->name('options.store');
    Route::get('/orders/confirm', function () {

        $options = \App\Models\Option::whereIn('key', [
            'company_name',
            'company_address',
            'invoice_date',
            'logo',
        ])->pluck('value', 'key');

        $companyDetails = [
            'company_name' => $options['company_name'] ?? null,
            'company_address' => $options['company_address'] ?? null,
            'invoice_date' => $options['invoice_date'] ?? null,
            'logo' => $options['logo'] ?? null,
        ];
        return Inertia::render('orders/confirm-order', [
            'customer' => request()->input('customer'),
            'items' => request()->input('items'),
            'companyDetails' => $companyDetails,
        ]);
    })->name('orders.confirm');

});
Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
