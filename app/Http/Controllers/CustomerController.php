<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveCustomerDetailsRequest;
use App\Http\Controllers\Api\CustomerController as ApiCustomerController;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends ApiCustomerController
{
    public function index(Request $request)
    {
        $response = parent::index($request);

        return Inertia::render('customers/index', [
            'customers' => $response
        ]);
    }

    public function store(SaveCustomerDetailsRequest $request)
    {
        $validated = $request->validated();
        Customer::create($validated);

        return redirect()->back()->with('success', 'Customer created successfully');
    }
}
