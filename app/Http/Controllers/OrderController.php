<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Models\ConsignmentItem;
use App\Models\Customer;
use App\Models\Option;
use App\Models\Order;
use App\Models\OrderItem;
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

    public function confirm()
    {
        $options = Option::whereIn('key', [
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
            'customer' => request()->input('customer'),
            'items' => request()->input('items'),
            'companyDetails' => $companyDetails,
            'orderId' => ''
        ]);
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

                    OrderItem::create([
                        'order_id' => $order->id,
                        'consignment_item_id' => $consignmentItem->id,
                        'unit_price' => $item['price'],
                        'qty' => $item['qty'],
                        'status' => 'pending',
                    ]);
                }
            });

            $customer = Customer::find($data['customer_id']);
            $options = Option::whereIn('key', [
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
                'success' => 'Order successfully created!',
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to save order: ' . $e->getMessage())->withInput();
        }
    }

}
