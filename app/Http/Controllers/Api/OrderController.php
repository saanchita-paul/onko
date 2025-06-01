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
            if ($request->has('date_range')) {
                $start = $request->input('date_range.from');
                $end = $request->input('date_range.to');
            }
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
                    $currentFrom = Carbon::parse($start)->startOfDay();
                    $currentTo = Carbon::parse($end)->endOfDay();
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
        $products = ConsignmentItem::query()
            ->join('products', 'products.id', '=', 'consignment_items.product_id')
            ->join('product_variants', 'product_variants.id', '=', 'consignment_items.product_variant_id')
            ->select(
                'products.id as id',
                'products.name as name',
                DB::raw('products.price / 100 as price'),
                'consignment_items.qty as quantity',
                'product_variants.id as variant_id',
                'product_variants.name as variant_name',
                'product_variants.options as variant_options'
            )
            ->orderBy('products.name')
            ->paginate(5);

        $products->getCollection()->transform(function ($item) {
            $item->variant_options = json_decode($item->variant_options, true) ?? [];
            return $item;
        });


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

    public function confirm(Request $request)
    {
        $companyDetails = Option::companyDetails();
        $tempTaxDiscount = session('temp_tax_discount', null);
        return [
            'customer' => $request->input('customer'),
            'items' => $request->input('items'),
            'companyDetails' => $companyDetails,
            'orderId' => '',
            'tempTaxDiscount' => $tempTaxDiscount,
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
            if (session()->has('temp_tax_discount')) {
                $temp = session('temp_tax_discount');

                $subTotal = $order->sub_total;

                if (($temp['tax_type'] ?? null) === 'percentage') {
                    $taxAmount = $subTotal * ($temp['tax'] / 100);
                } else {
                    $taxAmount = $temp['tax'] ?? 0;
                }

                if (($temp['discount_type'] ?? null) === 'percentage') {
                    $discountAmount = $subTotal * ($temp['discount'] / 100);
                } else {
                    $discountAmount = $temp['discount'] ?? 0;
                }

                $order->tax_total = $taxAmount;
                $order->discount_total = $discountAmount;

                $order->grand_total = $order->sub_total + $taxAmount - $discountAmount;
                $order->meta = [
                    'tax_description' => $temp['tax_description'] ?? '',
                    'tax_type' => $temp['tax_type'] ?? null,
                    'tax_percentage' => ($temp['tax_type'] ?? null) === 'percentage' ? $temp['tax'] : null,
                    'discount_description' => $temp['discount_description'] ?? '',
                    'discount_type' => $temp['discount_type'] ?? null,
                    'discount_percentage' => $temp['discount_type'] === 'percentage' ? $temp['discount'] : null,
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
            'discountTotal' => $order->discount_total,
            'taxTotal' => $order->tax_total,
            'meta' => json_decode($order->meta, true),
        ];
    }

    public function resetSession()
    {
        session()->forget('user_order_session');
        session()->forget('temp_tax_discount');
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

}
