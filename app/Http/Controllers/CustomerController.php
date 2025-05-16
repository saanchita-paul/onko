<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveCustomerDetailsRequest;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        return Inertia::render('customers/index', [
            'customers' => Customer::paginate(25)
        ]);
    }

    public function create(Request $request)
    {
        $customers = Customer::query()
            ->when($request->search, fn($q) =>
            $q->where('name', 'like', '%' . $request->search . '%')
            )
            ->paginate(3)
            ->withQueryString();

        return Inertia::render('orders/order-form', [
            'customers' => $customers,
            'filters' => $request->only('search'),
        ]);
    }


    public function store(SaveCustomerDetailsRequest $request)
    {
        $validated = $request->validated();
        Customer::create($validated);

        return redirect()->back()->with('success', 'Customer created successfully');
    }
}
