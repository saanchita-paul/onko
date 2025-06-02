<?php

namespace App\Http\Controllers;

use App\Models\ConsignmentItem;
use App\Models\Customer;
use App\Models\Option;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    public function index(Request $request)
    {
        $products = ConsignmentItem::query()
            ->join('products', 'products.id', '=', 'consignment_items.product_id')
            ->join('product_variants', 'product_variants.id', '=', 'consignment_items.product_variant_id')
            ->select(
                'products.id as id',
                'products.name as name',
                DB::raw('products.price / 100 as price'),
                DB::raw('SUM(consignment_items.qty - consignment_items.qty_sold - consignment_items.qty_waste) as quantity'),
                'product_variants.id as variant_id',
                'product_variants.name as variant_name',
                'product_variants.options as variant_options'
            )
            ->groupBy(
                'products.id',
                'products.name',
                'products.price',
                'product_variants.id',
                'product_variants.name',
                'product_variants.options'
            )
            ->orderBy('products.created_at', 'desc')
            ->paginate(5);

        $products->getCollection()->transform(function ($item) {
            $item->variant_options = json_decode($item->variant_options, true) ?? [];
            return $item;
        });

        return [
            'products' => $products,
        ];
    }
}
