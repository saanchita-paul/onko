<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreProductRequest;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function store(StoreProductRequest $request)
    {
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
            return response()->json(
                [
                    'status' => 'success',
                    'message' => 'Product Added Successfully'
                ]
            );

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(
                [
                    'status' => 'error',
                    'message' => $e->getMessage()
                ]
            );
        }
    }
}
