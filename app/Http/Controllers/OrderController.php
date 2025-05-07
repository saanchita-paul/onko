<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Product;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function create()
    {
//        return Inertia::render('orders/create', [
//            'products' => Product::all(),
//        ]);
        return Inertia::render('orders/create');
    }
}
