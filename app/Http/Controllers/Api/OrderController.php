<?php

namespace App\Http\Controllers\Api;


use App\Http\Requests\SaveTempTaxDiscountRequest;
use App\Http\Requests\StoreOrderRequest;
use App\Models\ConsignmentItem;
use App\Models\Customer;
use App\Models\Option;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $range = $request->input('range');
        $offset = $request->input('offset');
        $offset = (int) $offset;

        $query = Order::query();

        if ($range && $range !== 'all'){
            $today = Carbon::today();
            switch ($range) {
                case 'today':
                    $date = $today->copy()->addDays($offset);
                    $currentFrom = $date->copy()->startOfDay();
                    $currentTo = $date->copy()->endOfDay();
                    break;

                case 'week':
                    $startOfWeek = $today->copy()->startOfWeek(Carbon::SATURDAY)->addWeeks($offset);
                    $endOfWeek = $today->copy()->startOfWeek(Carbon::SATURDAY)->addWeeks($offset)->endOfWeek(Carbon::FRIDAY);
                    $currentFrom = $startOfWeek;
                    $currentTo = $endOfWeek;
                    break;

                case 'month':
                    $date = $today->copy()->addMonths($offset);
                    $currentFrom = $date->copy()->startOfMonth();
                    $currentTo = $date->copy()->endOfMonth();
                    break;

                case 'quarter':
                    $date = $today->copy()->addQuarters($offset);
                    $currentFrom = $date->copy()->startOfQuarter();
                    $currentTo = $date->copy()->endOfQuarter();
                    break;

                case 'year':
                    $date = $today->copy()->addYears($offset);
                    $currentFrom = $date->copy()->startOfYear();
                    $currentTo = $date->copy()->endOfYear();
                    break;
                case 'custom':
                    if ($request->has('date_range')) {
                        $start = $request->input('date_range.from');
                        $end = $request->input('date_range.to');
                        $currentFrom = Carbon::parse($start)->startOfDay();
                        $currentTo = Carbon::parse($end)->endOfDay();
                        break;
                    }
                    $currentFrom = null;
                    $currentTo = null;
                    break;

                default:
                    $currentFrom = null;
                    $currentTo = null;
                    break;
            }

            if ($currentFrom && $currentTo) {
                $query->whereBetween('created_at', [
                    $currentFrom->startOfDay(),
                    $currentTo->endOfDay()
                ]);
            }
        }

        return $query->paginate(5);
    }

    public function create(Request $request)
    {
        $companyDetails = Option::whereIn('key', [
            'company_name',
            'company_address',
            'logo'
        ])->pluck('value', 'key');

        $customers = Customer::query()
            ->when($request->search, fn($q) =>
            $q->where('name', 'like', '%' . $request->search . '%')
            )
            ->paginate(2)
            ->withQueryString();
        return [
            'companyDetails' => $companyDetails,
            'customers' => $customers
        ];
    }

    public function confirm(Request $request)
    {
        $companyDetails = Option::companyDetails();
        $tempTaxDiscount = session('temp_tax_discount', null);
        $orderOn = session('order_on') ?? now()->toDateString();
        return [
            'customer' => $request->input('customer'),
            'items' => $request->input('items'),
            'companyDetails' => $companyDetails,
            'orderId' => '',
            'tempTaxDiscount' => $tempTaxDiscount,
            'order_on' => $orderOn,
        ];
    }

    public function store(StoreOrderRequest $request)
    {
        $data = $request->validated();

        $order = null;

        DB::transaction(function () use ($data, &$order) {
            $orderOn = session('order_on') ?? now()->toDateString();

            $order = Order::create([
                'customer_id' => $data['customer_id'],
                'order_on' => $orderOn,
                'sub_total' => $data['sub_total'],
                'grand_total' => $data['grand_total'],
                'discount_total' => 0,
                'tax_total' => 0,
                'payments_total' => 0,
                'status' => 'pending',
                'meta' => null,
            ]);

            $items = collect([]);

            foreach ($data['items'] as $item) {
                $productId = $item['id'];
                $variantId = $item['variant_id'] ?? null;
                $requestedQty = $item['qty'];

                $consignmentItemQuery = ConsignmentItem::where('product_id', $productId);

                if ($variantId) {
                    $consignmentItemQuery->where('product_variant_id', $variantId);
                }

                $consignmentItem = $consignmentItemQuery
                    ->whereRaw('(qty - qty_sold - qty_waste) >= ?', [$requestedQty])
                    ->first();

                if (!$consignmentItem) {
                    $variantInfo = $variantId ? " and variant ID: {$variantId}" : "";
                    throw new \Exception("Consignment item not found for product ID: {$productId}{$variantInfo} or not enough available quantity.");
                }

                $items->push(new OrderItem([
                    'consignment_item_id' => $consignmentItem->id,
                    'unit_price' => $item['price'],
                    'qty' => $requestedQty,
                    'status' => 'pending',
                ]));

                $consignmentItem->increment('qty_sold', $requestedQty);
            }

            if (session()->has('temp_tax_discount')) {
                $temp = session('temp_tax_discount');
                $subTotal = $order->sub_total;

                $taxAmount = ($temp['tax_type'] ?? null) === 'percentage'
                    ? $subTotal * ($temp['tax'] / 100)
                    : ($temp['tax'] ?? 0);

                $discountAmount = ($temp['discount_type'] ?? null) === 'percentage'
                    ? $subTotal * ($temp['discount'] / 100)
                    : ($temp['discount'] ?? 0);

                $order->tax_total = $taxAmount;
                $order->discount_total = $discountAmount;
                $order->grand_total = $subTotal + $taxAmount - $discountAmount;

                $order->meta = [
                    'tax_description' => $temp['tax_description'] ?? '',
                    'tax_type' => $temp['tax_type'] ?? null,
                    'tax_percentage' => ($temp['tax_type'] ?? null) === 'percentage' ? $temp['tax'] : null,
                    'discount_description' => $temp['discount_description'] ?? '',
                    'discount_type' => $temp['discount_type'] ?? null,
                    'discount_percentage' => ($temp['discount_type'] ?? null) === 'percentage' ? $temp['discount'] : null,
                ];
            }

            $order->save();
            $order->orderItems()->saveMany($items);

            session()->forget('order_on');
            session()->forget('temp_tax_discount');
        });

        return $order;
    }

    public function show(Order $order)
    {
        $customer = $order->customer;
        $productIds = [];
        $productsQtyMap = [];
        $variantMap = [];

        foreach ($order->orderItems as $orderItem) {
            $consignmentItem = $orderItem->consignmentItem;
            $productId = $consignmentItem->product_id;
            $variantId = $consignmentItem->product_variant_id;

            $productIds[] = $productId;
            $productsQtyMap["{$productId}_{$variantId}"] = $orderItem->qty;
            $variantMap[$productId] = $variantId;

        }
        $items = [];
        $products = Product::whereIn('id', $productIds)->get();
        foreach ($products as $product) {
            $variantId = $variantMap[$product->id] ?? null;
            $consignmentItemQuery = ConsignmentItem::where('product_id', $product->id);
            if ($variantId) {
                $consignmentItemQuery->where('product_variant_id', $variantId);
            }
            $consignmentItem = $consignmentItemQuery->first();

            $availableQty = $consignmentItem
                ? ($consignmentItem->qty - $consignmentItem->qty_sold - $consignmentItem->qty_waste)
                : 0;
            $items[] = [
                'id' => $product->id,
                'name' => $product->name,
                'quantity' => $availableQty,
                'short_id' => $product->short_id,
                'price' => $product->price,
                'qty' => $productsQtyMap["{$product->id}_{$variantId}"] ?? 0
            ];
        }
        $companyDetails = Option::companyDetails();
        $orderOn = $order->order_on;
        return [
            'customer' => $customer,
            'items' => $items,
            'companyDetails' => $companyDetails,
            'orderId' => $order->id,
            'discountTotal' => $order->discount_total,
            'taxTotal' => $order->tax_total,
            'meta' => json_decode($order->meta, true),
            'order_on' => $orderOn
        ];
    }

    public function reset()
    {
        session()->forget('user_order_session');
        session()->forget('temp_tax_discount');
        session()->forget('order_on');

        return [
            'message' => 'Order session has been reset.',
        ];
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
                'discount_description' => $validated['discount_description'] ?? '',
            ]
        ]);
        return redirect()->back()->with('message', 'Temporary tax and discount saved in session.');
    }

    public function clearTempTaxDiscount()
    {
        session()->forget('temp_tax_discount');
        return response()->json(['message' => 'Temporary tax and discount session cleared.']);
    }


    public function markAsPaid(Order $order, Request $request)
    {

        $payment = Payment::create([
            'order_id' => $order->id,
            'payment_amount' => $order->grand_total,
            'payment_type' => 'cash',
            'status' => 'paid',
        ]);


        $order->update([
            'status' => 'paid',
            'payments_total' => $order->payments_total + $payment->payment_amount,
        ]);

        return response()->json([
            'message' => 'Order marked as paid successfully!',
            'order_status' => $order->status,
        ]);
    }

    public function setDateSession(Request $request)
    {
        $request->validate([
            'order_on' => 'required|date',
        ]);
        session(['order_on' => $request->order_on]);

        return redirect()->back()->with('message', 'Order date saved.');
    }

}
