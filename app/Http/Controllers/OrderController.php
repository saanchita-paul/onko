<?php

namespace App\Http\Controllers;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function create()
    {
        return Inertia::render('orders/create');
    }
}
