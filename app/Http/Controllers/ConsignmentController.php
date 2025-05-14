<?php

namespace App\Http\Controllers;

use App\Models\Consignment;
use Inertia\Inertia;

class ConsignmentController extends Controller
{
    public function index()
    {
        return Inertia::render('consignment/index', [
            'consignments' => Consignment::paginate(100)
        ]);
    }
}
