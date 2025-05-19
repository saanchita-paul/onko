<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use App\Http\Controllers\Api\SalesController as ApiSalesController;

class SalesController extends ApiSalesController
{
    public function index(Request $request)
    {
        $response = parent::index($request);

        return Inertia::render('sales/index', $response);
    }

}
