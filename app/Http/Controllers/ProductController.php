<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Models\Product;
use App\Http\Controllers\Api\ProductController as ProductControllerApi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ProductController extends ProductControllerApi
{
    public function index()
    {
        return Inertia::render('products/index', [
            'products' => Product::paginate(100)
        ]);
    }

    /**
     * @param StoreProductRequest $request
     * @return JsonResponse|RedirectResponse
     */
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
