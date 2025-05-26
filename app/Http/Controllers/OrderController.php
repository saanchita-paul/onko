<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveTempTaxDiscountRequest;
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
                'tempTaxDiscount' => session('temp_tax_discount')
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

    public function saveTempTaxDiscount(SaveTempTaxDiscountRequest $request)
    {
        $validated = $request->validated();
        session([
            'temp_tax_discount' => [
                'tax' => $validated['tax'] ?? null,
                'tax_type' => $validated['tax_type'] ?? 'fixed',
                'tax_description' => $validated['tax_description'] ?? '',
                'discount' => $validated['discount'] ?? null,
                'discount_type' => $validated['discount_type'] ?? 'fixed',
                'discount_description' => $validated['discount_description'] ?? ''
            ]
        ]);
        return redirect()->back()->with('message', 'Temporary tax and discount saved in session.');
    }

}
