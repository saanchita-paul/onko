<?php

use App\Http\Controllers\Api\OrderController;

Route::get('/orders/create', [OrderController::class, 'create'])->name('orders.create');
