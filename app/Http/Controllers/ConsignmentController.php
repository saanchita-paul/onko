<?php

namespace App\Http\Controllers;

use App\Models\Consignment;
use App\Http\Controllers\Api\ConsignmentController as ApiConsignmentController;
use App\Models\ConsignmentItem;
use http\Env\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ConsignmentController extends ApiConsignmentController
{
    public function index()
    {
        $consignments = parent::index();

        return Inertia::render('consignment/index', [
            'consignments' => $consignments
        ]);
    }

    public function store(Request $request){
        $consignment = new Consignment();
        try {
            if($request->id){
                $consignment->id = $request->id;
            }
            $consignment->lc_num = $request->lc_num;

            if(!$consignment->save()){
                throw new \Exception('Error saving consignment');
            }

            foreach ($request->items as $item){
                $consignmentItem = new ConsignmentItem();
                $consignmentItem->product_id = $item->product_id;
                $consignmentItem->product_variant_id = $item->product_variant_id;
                $consignmentItem->qty = $item->qty;
                $consignmentItem->cost_price = $item->price;

                $consignmentItem->save();
            }

            DB::commit();
        }
        catch (\Exception $exception){
            DB::rollBack();
            abort(500, $exception->getMessage());
        }
    }
}
