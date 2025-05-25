<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Models\ConsignmentItem;
use App\Models\Option;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
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

    public function confirm()
    {
        $companyDetails = Option::companyDetails();
        $sessionData = [
            'customer' => request()->input('customer'),
            'items' => request()->input('items'),
            'companyDetails' => $companyDetails,
            'orderId' => ''
        ];
        session(['user_order_session' => $sessionData]);
        return Inertia::render('orders/confirm-order', $sessionData);
    }

    public function store(StoreOrderRequest $request)
    {
        $data = $request->validated();

        try {
            $order = null;

            DB::transaction(function () use ($data, &$order) {
                $order = Order::create([
                    'customer_id' => $data['customer_id'],
                    'sub_total' => $data['sub_total'],
                    'grand_total' => $data['grand_total'],
                    'discount_total' => 0,
                    'tax_total' => 0,
                    'payments_total' => 0,
                    'status' => 'pending',
                    'meta' => null,
                ]);


                foreach ($data['items'] as $item) {
                    $consignmentItem = ConsignmentItem::where('product_id', $item['id'])->first();


                    if (!$consignmentItem) {
                        throw new \Exception("Consignment item not found for product ID: {$item['id']}");
                    }

                    if ($consignmentItem->qty < $item['qty']) {
                        throw new \Exception("Not enough consignment quantity for product ID: {$item['id']}");
                    }
                    OrderItem::create([
                        'order_id' => $order->id,
                        'consignment_item_id' => $consignmentItem->id,
                        'unit_price' => $item['price'],
                        'qty' => $item['qty'],
                        'status' => 'pending',
                    ]);

                    $consignmentItem->decrement('qty', $item['qty']);
                    $consignmentItem->increment('qty_sold', $item['qty']);

                    $product = Product::find($item['id']);
                    if ($product) {
                        if ($product->quantity < $item['qty']) {
                            throw new \Exception("Not enough product quantity for product ID: {$item['id']}");
                        }
                        $product->decrement('quantity', $item['qty']);
                    } else {
                        throw new \Exception("Product not found with ID: {$item['id']}");
                    }

                }
            });
            session()->forget('user_order_session');
            session()->forget('isReset');
            return redirect()->route('orders.show', $order->id);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to save order: ' . $e->getMessage())->withInput();
        }
    }

    public function show(Order $order)
    {
        $customer = $order->customer;
        $productIds = [];
        $productsQtyMap = [];
        foreach ($order->orderItems as $orderItem) {
            $productIds[] = $orderItem->consignmentItem->product_id;
            $productsQtyMap[$orderItem->consignmentItem->product_id] = $orderItem->qty;
        }
        $items = [];
        $products = Product::whereIn('id', $productIds)->get();
        foreach ($products as $product) {
            $items[] = [
                'id' => $product->id,
                'name' => $product->name,
                'quantity' => $product->quantity,
                'short_id' => $product->short_id,
                'price' => $product->price,
                'qty' => $productsQtyMap[$product->id]
            ];
        }
        $companyDetails = Option::companyDetails();

        return Inertia::render('orders/view', [
            'customer' => $customer,
            'items' => $items,
            'companyDetails' => $companyDetails,
            'orderId' => $order->id,
        ]);
    }


    public function reset()
    {
        session()->forget('user_order_session');
        return redirect()->route('orders.create')->with('isReset', true);
    }

}
