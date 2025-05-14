<?php

namespace App\Http\Controllers;

use App\Models\Consignment;
use App\Http\Controllers\Api\ConsignmentController as ApiConsignmentController;
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
}
