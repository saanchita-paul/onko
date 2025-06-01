<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreConsignmentRequest;
use App\Models\Consignment;
use App\Models\ConsignmentItem;
use Illuminate\Support\Facades\DB;

class ConsignmentController extends Controller
{
    public function index()
    {
        $consignments = Consignment::with('consignmentItems')->paginate(100);

        // Add a total_items field to each consignment
        $consignments->getCollection()->transform(function ($consignment) {
            $consignment->total_items = $consignment->consignmentItems->sum('qty');
            return $consignment;
        });

        return $consignments;
    }

    public function store(StoreConsignmentRequest $request)
    {
        DB::beginTransaction();

        try {
            $consignment = new Consignment();
            if($request->id){
                $consignment->id = $request->id;
            }
            $consignment->lc_num = $request->lc_num;
            $consignment->value = (int) $request->value * 100;

            if(!$consignment->save()){
                throw new \Exception('Error saving consignment');
            }

            $consignmentItems = [];

            foreach ($request->items as $item) {
                $cost_price = (int) $item['price'] * 100;

                $consignmentItems[] = new ConsignmentItem([
                    'product_id' => $item['product'],
                    'product_variant_id' => $item['variant'],
                    'qty' => $item['quantity'],
                    'cost_price' => $cost_price,
                ]);
            }

            $consignment->consignmentItems()->saveMany($consignmentItems);

            DB::commit();

            return response()->json(
                [
                    'status' => 'success',
                    'message' => 'Consignment Added Successfully'
                ]
            );
        }
        catch (\Exception $e){
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
