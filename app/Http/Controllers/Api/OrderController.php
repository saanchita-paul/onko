<?php

namespace App\Http\Controllers\Api;


use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::withCount('orderItems')->paginate(5);
        return response()->json([
            'orders' => $orders
        ]);
    }

}
