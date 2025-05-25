<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use Inertia\Inertia;
use App\Http\Controllers\Api\OrderController as ApiOrderController;
use Illuminate\Http\Request;

class OrderController extends ApiOrderController
{

    public function index(Request $request)
    {
        $response = parent::index($request);
        return Inertia::render('orders/index', [
            'orders' => $response
        ]);
    }
    public function create(Request $request)
    {
        $response = parent::create($request);

        $data = [
                'products' => $response['products'],
                'companyDetails' => $response['companyDetails'],
                'customers' => $response['customers'],
                'isReset' => session('isReset', false),
            ];
            $data['userOrderSession'] = session('user_order_session');

        return Inertia::render('orders/create', $data);
    }

    public function confirm(Request $request)
    {
        $sessionData = parent::getConfirmData($request);
        session(['user_order_session' => $sessionData]);
        return Inertia::render('orders/confirm-order', $sessionData);


    }

    public function store(StoreOrderRequest $request)
    {
        try {
            $order = parent::storeOrder($request);

            session()->forget('user_order_session');
            session()->forget('isReset');

            return redirect()->route('orders.show', $order->id);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to save order: ' . $e->getMessage())->withInput();
        }
    }

    public function show(Order $order)
    {
        $orderData = parent::showOrder($order);
        return Inertia::render('orders/view', $orderData);
    }


    public function reset()
    {
        parent::resetSession();
        return redirect()->route('orders.create')->with('isReset', true);
    }

}
