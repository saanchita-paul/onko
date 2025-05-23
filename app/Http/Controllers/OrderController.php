<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Models\ConsignmentItem;
use App\Models\Customer;
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
//                'userOrderSession' => session('user_order_session'),
                'isReset' => session('isReset', false),
            ];
//        if(!empty($request->get('editSession'))){
            $data['userOrderSession'] = session('user_order_session');
//        }

        return Inertia::render('orders/create', $data);
    }

    public function confirm()
    {
//        $options = Option::whereIn('key', [
//            'company_name',
//            'company_address',
//            'invoice_date',
//            'logo',
//        ])->pluck('value', 'key');
//
//        $companyDetails = [
//            'company_name' => $options['company_name'] ?? null,
//            'company_address' => $options['company_address'] ?? null,
//            'invoice_date' => $options['invoice_date'] ?? null,
//            'logo' => $options['logo'] ?? null,
//        ];
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

//    public function store(StoreOrderRequest $request)
//    {
//
//        $data = $request->validated();
//
//        try {
//            $order = null;
//
//            DB::transaction(function () use ($data, &$order) {
//                $order = Order::create([
//                    'customer_id' => $data['customer_id'],
//                    'sub_total' => $data['sub_total'],
//                    'grand_total' => $data['grand_total'],
//                    'discount_total' => 0,
//                    'tax_total' => 0,
//                    'payments_total' => 0,
//                    'status' => 'pending',
//                    'meta' => null,
//                ]);
//
//                foreach ($data['items'] as $item) {
//                    $consignmentItem = ConsignmentItem::where('product_id', $item['id'])->first();
//
//                    if (!$consignmentItem) {
//                        throw new \Exception("Consignment item not found for product ID: {$item['id']}");
//                    }
//
//                    OrderItem::create([
//                        'order_id' => $order->id,
//                        'consignment_item_id' => $consignmentItem->id,
//                        'unit_price' => $item['price'],
//                        'qty' => $item['qty'],
//                        'status' => 'pending',
//                    ]);
//                }
//            });
//
//            $customer = Customer::find($data['customer_id']);
//            $options = Option::whereIn('key', [
//                'company_name',
//                'company_address',
//                'invoice_date',
//                'logo',
//            ])->pluck('value', 'key');
//
//            $companyDetails = [
//                'company_name' => $options['company_name'] ?? null,
//                'company_address' => $options['company_address'] ?? null,
//                'invoice_date' => $options['invoice_date'] ?? null,
//                'logo' => $options['logo'] ?? null,
//            ];
//
//            return Inertia::render('orders/confirm-order', [
//                'customer' => $customer,
//                'items' => $data['items'],
//                'companyDetails' => $companyDetails,
//                'orderId' => $order->id,
//                'success' => 'Order successfully created!',
//            ]);
//        } catch (\Exception $e) {
//            return redirect()->back()->with('error', 'Failed to save order: ' . $e->getMessage())->withInput();
//        }
//    }

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

//                    dd($item);

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
//                    dd('hi');
//                    $consignmentItem->decrement('qty', $item['qty']);
//                    $consignmentItem->increment('qty_sold', $item['qty']);
//                    $product = Product::find($item['id']);
//
//                    if ($product && $product->qty >= $item['qty']) {
//                        $product->decrement('qty', $item['qty']);
//                    } else {
//                        throw new \Exception("Not enough product quantity for product ID: {$item['id']}");
//                    }

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
            return $e;
//            return redirect()->back()->with('error', 'Failed to save order: ' . $e->getMessage())->withInput();
        }
    }


}
