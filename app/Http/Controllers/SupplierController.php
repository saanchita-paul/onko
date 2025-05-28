<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Api\SupplierController as ApiSupplierController;
use Inertia\Inertia;

class SupplierController extends ApiSupplierController
{
    public function index()
    {
        return Inertia::render('suppliers/index', parent::index());
    }
}
