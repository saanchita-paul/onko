<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCompanyDetailsRequest;
use App\Http\Controllers\Api\OptionController as ApiOptionController;

class OptionController extends ApiOptionController
{

    public function store(StoreCompanyDetailsRequest $request)
    {
        parent::store($request);
    }
}
