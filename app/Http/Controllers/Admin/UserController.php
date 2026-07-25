<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::latest()->get();
        return Inertia::render('Admin/Users', [
            'users' => $users,
        ]);
    }

    public function approve(User $user): RedirectResponse
    {
        $user->update(['status' => 'approved']);
        return back()->with('message', "User {$user->name} approved successfully.");
    }

    public function reject(User $user): RedirectResponse
    {
        $user->update(['status' => 'rejected']);
        return back()->with('message', "User {$user->name} registration rejected.");
    }

    public function destroy(User $user): RedirectResponse
    {
        $user->delete();
        return back()->with('message', "User deleted successfully.");
    }
}
