<?php

namespace App\Http\Controllers;
use App\Models\Order;
use Inertia\Inertia;

class OrderController extends Controller
{

    public function index(){
        return Inertia::render('orders/index', [
            'orders' => Order::withCount('orderItems')
                        ->paginate(5)
        ]);
    }
    public function create()
    {
        return Inertia::render('orders/create');
    }
}
