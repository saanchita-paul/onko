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
            $logoPath = Storage::disk(config('filesystems.upload'))->putFile('company_logo', $request->file('logo'));
            $validated['logo'] = Storage::url($logoPath);
        }

        foreach ($validated as $key => $value) {
            Option::updateOrCreate(
                ['key' => $key],
                ['value' => is_array($value) ? json_encode($value) : $value]
            );
        }

        return redirect()->back()->with('success', 'Company details saved.');
    }

    public function deleteLogo()
    {
        $logoOption = Option::where('key', 'logo')->first();

        if ($logoOption && $logoOption->value) {
            $url = $logoOption->value;
            $prefix = Storage::disk(config('filesystems.upload'))->url('');

            if (str_starts_with($url, $prefix)) {
                $relativePath = str_replace($prefix, '', $url);
                Storage::disk(config('filesystems.upload'))->delete($relativePath);
            }

            $logoOption->value = null;
            $logoOption->save();
        }

        return response()->json(['message' => 'Logo deleted successfully']);
    }
}
