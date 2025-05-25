<?php

namespace App\Http\Controllers\Api;


use App\Http\Requests\StoreOrderRequest;
use App\Models\ConsignmentItem;
use App\Models\Customer;
use App\Models\Option;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            ->paginate(5);

        $companyDetails = Option::whereIn('key', [
            'company_name',
            'company_address',
            'invoice_date',
            'logo'
        ])->pluck('value', 'key');

        $customers = Customer::query()
            ->when($request->search, fn($q) =>
            $q->where('name', 'like', '%' . $request->search . '%')
            )
            ->paginate(2)
            ->withQueryString();
        return [
            'products' => $products,
            'companyDetails' => $companyDetails,
            'customers' => $customers
        ];
    }

    public function getConfirmData(Request $request)
    {
        $companyDetails = Option::companyDetails();

        return [
            'customer' => $request->input('customer'),
            'items' => $request->input('items'),
            'companyDetails' => $companyDetails,
            'orderId' => '',
        ];
    }

    public function storeOrder(StoreOrderRequest $request)
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
//                dd(session()->has('temp_tax_discount'));
            if (session()->has('temp_tax_discount')) {
                $temp = session('temp_tax_discount');

//                $order->tax_total = $temp['tax'] ?? 0;
//                $order->discount_total = $temp['discount'] ?? 0;

                $tax = $temp['tax'] ?? 0;
                $discount = $temp['discount'] ?? 0;

                $order->tax_total = $tax;
                $order->discount_total = $discount;

//                $order->sub_total = $order->sub_total + $tax - $discount;
                $order->grand_total = $order->grand_total + $tax - $discount;
                $order->meta = [
                    'tax_description' => $temp['tax_description'] ?? '',
                    'discount_description' => $temp['discount_description'] ?? '',
                ];
                $order->save();

                session()->forget('temp_tax_discount');
            } else {
                $order->save();
            }
        });
            return $order;
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to save order: ' . $e->getMessage())->withInput();
        }
    }

    public function showOrder(Order $order)
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

        return [
            'customer' => $customer,
            'items' => $items,
            'companyDetails' => $companyDetails,
            'orderId' => $order->id,
        ];
    }

    public function resetSession()
    {
        session()->forget('user_order_session');

        return [
            'message' => 'Order session has been reset.',
        ];
    }

    public function saveTempTaxDiscount(Request $request)
    {
        $validated = $request->validate([
            'tax' => 'nullable|numeric',
            'tax_description' => 'nullable|string',
            'discount' => 'nullable|numeric',
            'discount_description' => 'nullable|string'
        ]);

        session([
            'temp_tax_discount' => [
                'tax' => $validated['tax'] ?? null,
                'tax_description' => $validated['tax_description'] ?? '',
                'discount' => $validated['discount'] ?? null,
                'discount_description' => $validated['discount_description'] ?? ''
            ]
        ]);

        return response()->json(['message' => 'Temporary tax and discount saved in session.']);
    }



}
