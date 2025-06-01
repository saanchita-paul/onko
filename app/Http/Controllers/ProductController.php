<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Models\Product;
use App\Http\Controllers\Api\ProductController as ApiController;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends ApiController
{
    public function index()
    {
        return Inertia::render('products/index', [
            'products' => Product::paginate(100)
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        $response = parent::store($request);

        if ($response->getData()->status === 'success')
        {
            return redirect()->route('products.index')->with('success', $response->getData()->message);
        }

        elseif ($response->getData()->status === 'error')
        {
            return back()->with('error', $response->getData()->message);
        }

        return back()->with('error', 'Something went wrong');
    }
}
