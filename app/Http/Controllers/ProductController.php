<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

    public function store(StoreProductRequest $request)
    {
        DB::beginTransaction();
        try {
            $product = new Product();
            $product->name = $request->product_name;
            $product->description = $request->product_description;
            $product->hasVariations = $request->has_variations;

            if (!$product->save()) {
                throw new \Exception('Product Not Saved');
            }

            foreach ($request->variants as $variant) {
                $productAttribute = new ProductAttribute();
                $productAttribute->product_id = $product->id;
                $productAttribute->name = $variant['name'];
                $productAttribute->options = $variant['options'];
                $productAttribute->save();
            }

            foreach ($request->combinations as $combination) {
                $variationName = $request->product_name . ' ' . implode(' ', array_values((array)$combination));
                $productVariant = new ProductVariant();
                $productVariant->product_id = $product->id;
                $productVariant->name = $variationName;
                $productVariant->options = $combination;
                $productVariant->save();
            }

            DB::commit();
            return redirect()->route('products.index')->with('success', 'Product created successfully.');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', $e->getMessage());
        }
    }
}
