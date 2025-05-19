<?php

namespace App\Http\Controllers;

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

        return Inertia::render('orders/create', [
            'products' => $response['products'],
            'companyDetails' => $response['companyDetails'],
            'customers' => $response['customers'],
        ]);
    }

    public function store(Request $request)
    {
        $validator = validator($request->all(), [
            'customer_id' => 'required|uuid|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|uuid|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'sub_total' => 'required|numeric|min:0',
            'grand_total' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $data = $validator->validated();

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

                    OrderItem::create([
                        'order_id' => $order->id,
                        'consignment_item_id' => $consignmentItem->id,
                        'unit_price' => $item['price'],
                        'qty' => $item['qty'],
                        'status' => 'pending',
                    ]);
                }
            });


//            return redirect()->back()->with('success', 'Order confirmed successfully!');
            $customer = Customer::find($data['customer_id']);
            $options = \App\Models\Option::whereIn('key', [
                'company_name',
                'company_address',
                'invoice_date',
                'logo',
            ])->pluck('value', 'key');

            $companyDetails = [
                'company_name' => $options['company_name'] ?? null,
                'company_address' => $options['company_address'] ?? null,
                'invoice_date' => $options['invoice_date'] ?? null,
                'logo' => $options['logo'] ?? null,
            ];

            return Inertia::render('orders/confirm-order', [
                'customer' => $customer,
                'items' => $data['items'],
                'companyDetails' => $companyDetails,
                'orderId' => $order->id,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to save order: ' . $e->getMessage())->withInput();
        }
    }

}
