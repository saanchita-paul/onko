<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveCustomerDetailsRequest;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class CustomerController extends Controller
{
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

        return Inertia::render('customers/index', [
            'customers' => $query->paginate(5)
        ]);
    }

    public function store(SaveCustomerDetailsRequest $request)
    {
        $validated = $request->validated();
        Customer::create($validated);

        return redirect()->back()->with('success', 'Customer created successfully');
    }
}
