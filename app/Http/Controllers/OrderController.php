<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use Illuminate\Support\Facades\Log;
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

        $userOrderSession = session('user_order_session', []);
        $userOrderSession['order_on'] = session('order_on');

        $data = [
            'companyDetails' => $response['companyDetails'],
            'customers' => $response['customers'],
            'isReset' => session('isReset', false),
            'tempTaxDiscount' => session('temp_tax_discount'),
        ];
        if(!empty($request->get('editSession'))){
            $data['userOrderSession'] = session('user_order_session');
        }else{
            session()->forget('user_order_session');
            session()->forget('temp_tax_discount');
        }

        return Inertia::render('orders/create', $data);
    }

    public function confirm(Request $request)
    {
        try{
            $sessionData = parent::confirm($request);
            session(['user_order_session' => $sessionData]);
            return Inertia::render('orders/confirm-order', $sessionData);
        }catch (\Exception $e){
            Log::error('confirm::error occurred', [$e->getMessage(), $e->getTrace()]);
            return redirect()->back()->withErrors(['error' => 'An error occurred while confirming the order. Please try again later.']);
        }


    }

    public function store(StoreOrderRequest $request)
    {
        try {
            $order = parent::store($request);

            session()->forget('user_order_session');
            session()->forget('isReset');

            return redirect()->route('orders.show', $order->id);
        } catch (\Exception $e) {
            Log::error('storeOrder::error occurred', [$e->getMessage(), $e->getTrace()]);
            return redirect()->back()->with('error', 'Failed to save order: ' . $e->getMessage())->withInput();
        }
    }

    public function show(Order $order)
    {
        $orderData = parent::show($order);
        return Inertia::render('orders/view', $orderData);
    }


    public function reset()
    {
        parent::reset();
        return redirect()->route('orders.create')->with('isReset', true);
    }




}
