<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreConsignmentRequest;
use App\Models\Consignment;
use App\Http\Controllers\Api\ConsignmentController as ApiConsignmentController;
use App\Models\ConsignmentItem;
use Illuminate\Http\Request;
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

    public function store(StoreConsignmentRequest $request){
        $response = parent::store($request);

        if ($response->getData()->status === 'success')
        {
            return redirect()->route('consignments.index')->with('success', $response->getData()->message);
        }

        elseif ($response->getData()->status === 'error')
        {
            return back()->with('error', $response->getData()->message);
        }

        return back()->with('error', 'Something went wrong');
    }
}
