<?php

use App\Http\Controllers\ConsignmentController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\EmployeeController;
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
    Route::get('/consignments', [ConsignmentController::class, 'index'])->name('consignments.index');
    Route::get('/sales', [SalesController::class, 'index'])->name('sales.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
