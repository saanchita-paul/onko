<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCompanyDetailsRequest;
use App\Models\Option;

class OptionController extends Controller
{

    public function store(StoreCompanyDetailsRequest $request)
    {
        $validated = $request->validated();
        Option::setValue('company_name', $validated['company_name']);
        Option::setValue('company_address', $validated['company_address'] ?? '');
        Option::setValue('invoice_date', $validated['invoice_date']);

        return redirect()->back()->with('success', 'Company details saved.');
    }
}
