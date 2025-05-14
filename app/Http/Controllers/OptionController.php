<?php

namespace App\Http\Controllers;

use App\Models\Option;
use Illuminate\Http\Request;

class OptionController extends Controller
{

    public function saveCompanyDetails(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'company_address' => 'nullable|string',
            'invoice_date' => 'required|date',
        ]);

        Option::setValue('company_name', $validated['company_name']);
        Option::setValue('company_address', $validated['company_address'] ?? '');
        Option::setValue('invoice_date', $validated['invoice_date']);

        return redirect()->back()->with('success', 'Company details saved.');
    }
}
