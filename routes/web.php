<?php

use App\Http\Controllers\ConsignmentController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\OptionController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\SupplierController;
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
    Route::post('/orders/confirm', [OrderController::class, 'confirm'])->name('orders.confirm');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('/order/reset', [OrderController::class, 'reset'])->name('orders.reset');
    Route::post('/orders/temp-tax-discount', [OrderController::class, 'saveTempTaxDiscount']);
    Route::delete('/orders/temp-tax-discount', [OrderController::class, 'clearTempTaxDiscount']);
    Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index');


});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
