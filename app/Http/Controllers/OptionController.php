<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCompanyDetailsRequest;
use App\Models\Option;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OptionController extends controller
{

    public function store(StoreCompanyDetailsRequest $request)
    {
        Log::info('request',$request->all());
        $validated = $request->validated();

        if ($request->hasFile('logo') && $request->file('logo')->isValid()) {
            $logoPath = Storage::disk('public')->putFile('company_logo', $request->file('logo'));
            $validated['logo'] = $logoPath;
        }

        foreach ($validated as $key => $value) {
            Log::info("Saving/Updating option - Key: $key, Value: " . (is_array($value) ? json_encode($value) : $value));
            Option::updateOrCreate(
                ['key' => $key],
                ['value' => is_array($value) ? json_encode($value) : $value]
            );
        }

        return redirect()->back()->with('success', 'Company details saved.');
    }
}
