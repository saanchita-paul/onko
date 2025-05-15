<?php

namespace App\Http\Controllers\Api;


use App\Models\Option;
use App\Models\Order;
use App\Models\Product;
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

    public function create(Request $request)
    {
        $products = Product::select('id', 'name', 'quantity', 'price')
            ->paginate(10);
        $companyDetails = Option::whereIn('key', [
            'company_name',
            'company_address',
            'invoice_date',
            'logo'
        ])->pluck('value', 'key');

        return [
            'products' => $products,
            'companyDetails' => $companyDetails,
        ];
    }

}
