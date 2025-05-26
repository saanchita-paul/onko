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
        session()->forget('temp_tax_discount');
        session()->forget('user_order_session');
        session()->forget('isReset');
        $response = parent::index($request);

        return Inertia::render('sales/index', $response);
    }

}
