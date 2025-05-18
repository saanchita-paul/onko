<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Employee\StoreEmployeeRequest;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $employees = Employee::paginate(10);

        return $employees;
    }

    public function store(StoreEmployeeRequest $request)
    {
        $employee = new Employee();

        $request->hired_on = Carbon::parse($request->hired_on)->format('Y-m-d H:i:s');


        $employee->name = $request->name;
        $employee->position = $request->position;
        $employee->hired_on = $request->hired_on;

        return $employee->save();
    }

}
