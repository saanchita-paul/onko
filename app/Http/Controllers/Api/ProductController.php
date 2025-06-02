<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreProductRequest;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
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

            if($request->has_variations){
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
            }
            else{
                $productAttribute = new ProductAttribute();
                $productAttribute->product_id = $product->id;
                $productAttribute->name = $product->name;
                $productAttribute->options = json_encode(['Default']);
                $productAttribute->save();

                $productVariant = new ProductVariant();
                $productVariant->product_id = $product->id;
                $productVariant->name = $product->name;
                $productVariant->options = json_encode(['Default']);
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

    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $products = Product::query()
            ->select('id', 'name')
            ->where('name', 'like', "%{$query}%")
            ->limit(20)
            ->get();

        return response()->json($products);
    }

    public function variants(Product $product)
    {
        $variants = $product->productVariants()->select('id', 'name', 'product_id')->get();
        return response()->json($variants);
    }
}
