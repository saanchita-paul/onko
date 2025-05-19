<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class SalesController extends Controller
{
//        public function index(Request $request)
//        {
//            $query = Order::query();
//            $prevQuery = Order::query();
//            $range = $request->input('range');
//            $dateRange = $request->input('date_range');
//            $comparison  = "Test";
//
//            if($range && $range !== 'all'){
//                if ($request->has('date_range')) {
//                    $start = $request->input('date_range.from');
//                    $end = $request->input('date_range.to');
//
//                    if ($start && $end) {
//                        $query->whereBetween('created_at', [
//                            Carbon::parse($start)->startOfDay(),
//                            Carbon::parse($end)->endOfDay()
//                        ]);
//                    }
//                }
//                if($range !=='custom'){
//                    if ($request->has('previous_date_range')) {
//                        $start = $request->input('previous_date_range.from');
//                        $end = $request->input('previous_date_range.to');
//
//                        if ($start && $end) {
//                            $prevQuery->whereBetween('created_at', [
//                                Carbon::parse($start)->startOfDay(),
//                                Carbon::parse($end)->endOfDay()
//                            ]);
//                        }
//                    }
//                }
//            }
//
//            $grandTotal = round($query->sum('grand_total') / 100, 2);
//            $orders = $query->get();
//            $totalOrder = $query->count();
//            $averageValue = $totalOrder > 0 ? round($grandTotal / $totalOrder, 2) : 0;
//
//            $prevGrandTotal = round($prevQuery->sum('grand_total') / 100, 2);
//
//            return Inertia::render('sales/index',[
//                'orders' => $orders,
//                'range' => $range,
//                'date_range' => $dateRange,
//                'grand_total' => $grandTotal,
//                'total_order' => $totalOrder,
//                'average_value' => $averageValue,
//            ]);
//        }

    public function index(Request $request)
    {
        $query = Order::query();
        $prevQuery = Order::query();
        $range = $request->input('range');

        if ($range && $range !== 'all') {
            $today = Carbon::today();

            if ($request->has('date_range')){
                $start = $request->input('date_range.from');
                $end = $request->input('date_range.to');
            }
            switch ($range) {
                case 'week':
                    $currentFrom = $today->copy()->startOfWeek(Carbon::SATURDAY);
                    $currentTo = $today->copy()->endOfWeek(Carbon::SATURDAY);

                    $previousFrom = $currentFrom->copy()->subWeek();
                    $previousTo = $currentTo->copy()->subWeek();
                    break;

                case 'month':
                    $currentFrom = $today->copy()->startOfMonth();
                    $currentTo = $today->copy()->endOfMonth();

                    $previousFrom = $currentFrom->copy()->subMonth();
                    $previousTo = $currentTo->copy()->subMonth();
                    break;

                case 'quarter':
                    $currentFrom = $today->copy()->startOfQuarter();
                    $currentTo = $today->copy()->endOfQuarter();

                    $previousFrom = $currentFrom->copy()->subQuarter();
                    $previousTo = $currentTo->copy()->subQuarter();
                    break;

                case 'year':
                    $currentFrom = $today->copy()->startOfYear();
                    $currentTo = $today->copy()->endOfYear();

                    $previousFrom = $currentFrom->copy()->subYear();
                    $previousTo = $currentTo->copy()->subYear();
                    break;

                case 'custom':
                    $currentFrom = $start;
                    $currentTo = $end;
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
        $averageValue = $totalOrder > 0 ? round($grandTotal / $totalOrder, 2) : 0;

        $prevGrandTotal = round($prevQuery->sum('grand_total') / 100, 2);

        return Inertia::render('sales/index', [
            'orders' => $orders,
            'grand_total' => $grandTotal,
            'total_order' => $totalOrder,
            'average_value' => $averageValue,
        ]);
    }

}
