<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCompanyDetailsRequest;
use App\Models\Option;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OptionController extends Controller
{

    public function store(StoreCompanyDetailsRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('logo') && $request->file('logo')->isValid()) {
            $logoPath = Storage::disk('public')->putFile('company_logo', $request->file('logo'));
            $validated['logo'] = $logoPath;
        }

        foreach ($validated as $key => $value) {
            Log::info($value);
            Option::updateOrCreate(
                ['key' => $key],
                ['value' => is_array($value) ? json_encode($value) : $value]
            );
        }

        return redirect()->back()->with('success', 'Company details saved successfully.');
    }
}
