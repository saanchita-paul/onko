<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

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
        $pevRangeName = "";

        if ($range && $range !== 'all') {
            $today = Carbon::today();

            if ($request->has('date_range')) {
                $start = $request->input('date_range.from');
                $end = $request->input('date_range.to');
            }
            switch ($range) {
                case 'week':
                    $currentFrom = $today->copy()->startOfWeek(Carbon::SATURDAY);
                    $currentTo = $today->copy()->endOfWeek(Carbon::SATURDAY);

                    $previousFrom = $currentFrom->copy()->subWeek();
                    $previousTo = $currentTo->copy()->subWeek();

                    $pevRangeName = 'Last Week';
                    break;

                case 'month':
                    $currentFrom = $today->copy()->startOfMonth();
                    $currentTo = $today->copy()->endOfMonth();

                    $previousFrom = $currentFrom->copy()->subMonth();
                    $previousTo = $currentTo->copy()->subMonth();

                    $pevRangeName = 'Last Month';
                    break;

                case 'quarter':
                    $currentFrom = $today->copy()->startOfQuarter();
                    $currentTo = $today->copy()->endOfQuarter();

                    $previousFrom = $currentFrom->copy()->subQuarter();
                    $previousTo = $currentTo->copy()->subQuarter();

                    $pevRangeName = 'Last Quarter';
                    break;

                case 'year':
                    $currentFrom = $today->copy()->startOfYear();
                    $currentTo = $today->copy()->endOfYear();

                    $previousFrom = $currentFrom->copy()->subYear();
                    $previousTo = $currentTo->copy()->subYear();

                    $pevRangeName = 'Last Year';
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
            }

            if ($range !== 'custom' && $previousFrom && $previousTo) {
                $prevQuery->whereBetween('created_at', [
                    $previousFrom->startOfDay(),
                    $previousTo->endOfDay()
                ]);
            }
        }

        $grandTotal = round($query->sum('grand_total') / 100, 2);
        $orders = $query->get();
        $totalOrder = $query->count();
        $averageValue = round($query->avg('grand_total') / 100, 2);

        $prevGrandTotal = round($prevQuery->sum('grand_total') / 100, 2);
        $prevTotalOrder = $prevQuery->count();
        $prevAverageValue = round($prevQuery->avg('grand_total') / 100, 2);

        $compare = function ($current, $previous, $pevRangeName) {
            if ($previous == 0) {
                return $current == 0 ? 'No change' : '+ 100% Since ' . $pevRangeName;
            }

            $diff = $current - $previous;
            $percent = round(($diff / $previous) * 100, 1);

            if ($percent == 0) {
                return 'No change' . " Since " . $pevRangeName;
            }

            return $percent > 0 ? "+ {$percent}%     Since " . $pevRangeName : "- " . abs($percent) . "% Since " . $pevRangeName;
        };

        return [
            'orders' => $orders,
            'grand_total' => $grandTotal,
            'total_order' => $totalOrder,
            'average_value' => $averageValue,
            'comparison' => [
                'grand_total' => !in_array($range, ['all', 'custom']) ? $compare($grandTotal, $prevGrandTotal, $pevRangeName) : '',
                'total_order' => !in_array($range, ['all', 'custom']) ? $compare($totalOrder, $prevTotalOrder, $pevRangeName) : '',
                'average_value' => !in_array($range, ['all', 'custom']) ? $compare($averageValue, $prevAverageValue, $pevRangeName) : '',
            ]
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
