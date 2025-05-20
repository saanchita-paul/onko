<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class SalesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Order::query();
        $prevQuery = Order::query();
        $range = $request->input('range');
        $prevRangeName = "";

        $bestSellerSubQuery = OrderItem::join('consignment_items', 'order_items.consignment_item_id', '=', 'consignment_items.id')
            ->select([
                'consignment_items.product_id',
                DB::raw('SUM(order_items.qty) AS sum_qty'),
                DB::raw('SUM(order_items.qty * order_items.unit_price) AS subtotal')
            ])
            ->groupBy('consignment_items.product_id');

        if ($range && $range !== 'all') {
            $today = Carbon::today();

            if ($request->has('date_range')) {
                $start = $request->input('date_range.from');
                $end = $request->input('date_range.to');
            }
            switch ($range) {
                case 'today':
                    $currentFrom = Carbon::today()->startOfDay();
                    $currentTo = Carbon::today()->endOfDay();

                    $previousFrom = Carbon::today()->subDays(1);
                    $previousTo = Carbon::today()->subDays(1);

                    $prevRangeName = 'Yesterday';
                    break;
                case 'week':
                    $currentFrom = $today->copy()->startOfWeek(Carbon::SATURDAY);
                    $currentTo = $today->copy()->endOfWeek(Carbon::SATURDAY);

                    $previousFrom = $currentFrom->copy()->subWeek();
                    $previousTo = $currentTo->copy()->subWeek();

                    $prevRangeName = 'Last Week';
                    break;

                case 'month':
                    $currentFrom = $today->copy()->startOfMonth();
                    $currentTo = $today->copy()->endOfMonth();

                    $previousFrom = $currentFrom->copy()->subMonth();
                    $previousTo = $currentTo->copy()->subMonth();

                    $prevRangeName = 'Last Month';
                    break;

                case 'quarter':
                    $currentFrom = $today->copy()->startOfQuarter();
                    $currentTo = $today->copy()->endOfQuarter();

                    $previousFrom = $currentFrom->copy()->subQuarter();
                    $previousTo = $currentTo->copy()->subQuarter();

                    $prevRangeName = 'Last Quarter';
                    break;

                case 'year':
                    $currentFrom = $today->copy()->startOfYear();
                    $currentTo = $today->copy()->endOfYear();

                    $previousFrom = $currentFrom->copy()->subYear();
                    $previousTo = $currentTo->copy()->subYear();

                    $prevRangeName = 'Last Year';
                    break;

                case 'custom':
                    $currentFrom = Carbon::parse($start)->startOfDay();
                    $currentTo = Carbon::parse($end)->endOfDay();
                    $previousFrom = null;
                    $previousTo = null;
                    break;
                default:
                    $currentFrom = null;
                    $currentTo = null;
                    $previousFrom = null;
                    $previousTo = null;
                    break;
            }

            if ($currentFrom && $currentTo) {
                $query->whereBetween('created_at', [
                    $currentFrom->startOfDay(),
                    $currentTo->endOfDay()
                ]);

                $bestSellerSubQuery->whereIn('order_items.order_id', Order::whereBetween('created_at',  [
                    $currentFrom->startOfDay(),
                    $currentTo->endOfDay()
                ])->select(['id']));
            }

            if ($range !== 'custom' && $previousFrom && $previousTo) {
                $prevQuery->whereBetween('created_at', [
                    $previousFrom->startOfDay(),
                    $previousTo->endOfDay()
                ]);
            }
        }

        $subQuantity = (clone $bestSellerSubQuery)->orderByDesc('sum_qty')->limit(10);
        $subSubTotal = (clone $bestSellerSubQuery)->orderByDesc('subtotal')->limit(10);

        $quantity = Product::joinSub($subQuantity, 'X', function(JoinClause $join) {
            $join->on('products.id', '=', 'X.product_id');
        })->select(['id', 'name', 'product_id', 'sum_qty', 'subtotal'])->get();

        $subtotal = Product::joinSub($subSubTotal, 'X', function(JoinClause $join) {
            $join->on('products.id', '=', 'X.product_id');
        })->select(['id', 'name', 'product_id', 'sum_qty', 'subtotal'])->get();

        $grandTotal = round($query->sum('grand_total') / 100, 2);
        $orders = $query->get();
        $totalOrder = $query->count();
        $averageValue = round($query->avg('grand_total') / 100, 2);

        $prevGrandTotal = round($prevQuery->sum('grand_total') / 100, 2);
        $prevTotalOrder = $prevQuery->count();
        $prevAverageValue = round($prevQuery->avg('grand_total') / 100, 2);

        $compare = function ($current, $previous, $prevRangeName) {
            if ($previous == 0) {
                return $current == 0 ? 'No change' : '+ 100% Since ' . $prevRangeName;
            }

            $diff = $current - $previous;
            $percent = round(($diff / $previous) * 100, 1);

            if ($percent == 0) {
                return 'No change' . " Since " . $prevRangeName;
            }

            return $percent > 0 ? "+ {$percent}%     Since " . $prevRangeName : "- " . abs($percent) . "% Since " . $prevRangeName;
        };

        return [
            'orders' => $orders,
            'grand_total' => $grandTotal,
            'total_order' => $totalOrder,
            'average_value' => $averageValue,
            'comparison' => [
                'grand_total' => !in_array($range, ['all', 'custom']) ? $compare($grandTotal, $prevGrandTotal, $prevRangeName) : '',
                'total_order' => !in_array($range, ['all', 'custom']) ? $compare($totalOrder, $prevTotalOrder, $prevRangeName) : '',
                'average_value' => !in_array($range, ['all', 'custom']) ? $compare($averageValue, $prevAverageValue, $prevRangeName) : '',
            ],
            'bQuantity' => $quantity,
            'bSubTotal' => $subtotal,
        ];
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
