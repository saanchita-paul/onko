<?php

use App\Http\Controllers\StockController;

Route::get('/orders/create', [StockController::class, 'index'])->name('stock.index');
