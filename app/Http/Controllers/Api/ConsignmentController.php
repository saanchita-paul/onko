<?php

namespace App\Http\Controllers\Api;

use App\Models\Consignment;

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
}
