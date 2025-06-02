<?php

use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\StockController;

Route::get('/stock', [StockController::class, 'index'])->name('stock.index');
Route::post('/orders/{order}/mark-as-paid', [OrderController::class, 'markAsPaid'])->name('orders.markAsPaid');
