<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Api\SupplierController as ApiSupplierController;

class SupplierController extends ApiSupplierController
{
    public function index()
    {
        return parent::index();
    }
}
