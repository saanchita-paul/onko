<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        return Inertia::render('customers/index', [
            'customers' => Customer::paginate(100)
        ]);
    }
}
