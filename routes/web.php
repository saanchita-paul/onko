<?php

use App\Http\Controllers\ConsignmentController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\OptionController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SalesController;
use App\Models\Order;
use App\Models\Product;
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
    Route::get('/orders/{order}', function (Order $order) {
        $customer = $order->customer;
        $productIds = [];
        $productsQtyMap = [];
        foreach ($order->orderItems as $orderItem) {
            $productIds[] = $orderItem->consignmentItem->product_id;
            $productsQtyMap[$orderItem->consignmentItem->product_id] = $orderItem->qty;
        }
//        dd($productsQtyMap);
        $items = [];
        $products = Product::whereIn('id', $productIds)->get();
        foreach($products as $product){
            $items[] = [
                'id' => $product->id,
                'name' => $product->name,
                'quantity' => $product->quantity,
                'short_id' =>  $product->short_id,
                'price' => $product->price,
                'qty' => $productsQtyMap[$product->id]
            ];
        }
//        dd($items);
        $companyDetails = \App\Models\Option::companyDetails();

        return Inertia::render('orders/view', [
            'customer' => $customer,
            'items' => $items,
            'companyDetails' => $companyDetails,
            'orderId' => $order->id,
        ]);
    })->name('orders.show');

    Route::post('order/reset', function () {
        session()->forget('user_order_session');
//        dd(session('user_order_session'));
        return redirect()->route('orders.create')->with('isReset', true);
    })->name('orders.reset');


});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
