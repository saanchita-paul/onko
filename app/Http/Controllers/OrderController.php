<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Http\Controllers\Api\OrderController as ApiOrderController;
use Illuminate\Http\Request;

class OrderController extends ApiOrderController
{

    public function index(Request $request)
    {
        $response = parent::index($request);
        $orders = json_decode($response->getContent(), true)['orders'];
        return Inertia::render('orders/index', [
            'orders' => $orders
        ]);
    }
    public function create()
    {
        return Inertia::render('orders/create');
    }
}
