<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    //

    public function index()
    {
        return Inertia::render('products/index', [
            'products' => Product::paginate(100)
        ]);
    }
}
