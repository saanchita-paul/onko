<?php

use App\Http\Controllers\StockController;

Route::get('/stock', [StockController::class, 'index'])->name('stock.index');
