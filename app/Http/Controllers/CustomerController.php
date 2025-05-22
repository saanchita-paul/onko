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

        $query = Customer::query();

        if ($range && $range !== 'all'){
            $today = Carbon::today();
            switch ($range) {
                case 'today':
                    $currentFrom = Carbon::today()->startOfDay();
                    $currentTo = Carbon::today()->endOfDay();
                    break;
                case 'week':
                    $currentFrom = $today->copy()->startOfWeek(Carbon::SATURDAY);
                    $currentTo = $today->copy()->endOfWeek(Carbon::FRIDAY);
                    break;

                case 'month':
                    $currentFrom = $today->copy()->startOfMonth();
                    $currentTo = $today->copy()->endOfMonth();
                    break;

                case 'quarter':
                    $currentFrom = $today->copy()->startOfQuarter();
                    $currentTo = $today->copy()->endOfQuarter();
                    break;

                case 'year':
                    $currentFrom = $today->copy()->startOfYear();
                    $currentTo = $today->copy()->endOfYear();
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
