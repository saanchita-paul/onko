<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveCustomerDetailsRequest;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $range = $request->input('range');
        $offset = $request->input('offset');
        $offset = (int) $offset;

        $query = Customer::query();

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

    public function store(SaveCustomerDetailsRequest $request)
    {
        $validated = $request->validated();
        $customer = Customer::create($validated);


        return response()->json([
            'success' => true,
            'customer' => $customer,
            'message' => 'Customer created successfully',
        ]);
    }

}
