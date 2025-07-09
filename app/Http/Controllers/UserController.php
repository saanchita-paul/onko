<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return $users = User::select('name', 'created_at')->get();
//        return view('user', compact('users'));
    }
}
