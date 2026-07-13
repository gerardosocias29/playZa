<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Welcome / Guest landing page
Route::get('/', function () {
    return Inertia::render('Welcome');
});

// Authentication Mock Routes
Route::get('/login', function () {
    return Inertia::render('Auth/Login');
})->name('login');

Route::get('/register', function () {
    return Inertia::render('Auth/Register');
})->name('register');

// Guest profile fallback
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

// Admin Mock Routes (No DB middleware)
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('dashboard');
    
    Route::get('/users', function () {
        return Inertia::render('Admin/Users');
    })->name('users');
    
    Route::get('/facilities', function () {
        return Inertia::render('Admin/Facilities');
    })->name('facilities');
    
    Route::get('/reservations', function () {
        return Inertia::render('Admin/Reservations');
    })->name('reservations');
    
    Route::get('/schedules', function () {
        return Inertia::render('Admin/Schedules');
    })->name('schedules');
    
    Route::get('/reports', function () {
        return Inertia::render('Admin/Reports');
    })->name('reports');
});

// User Mock Routes (No DB middleware)
Route::prefix('user')->name('user.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('User/Dashboard');
    })->name('dashboard');
    
    Route::get('/facilities', function () {
        return Inertia::render('User/Facilities');
    })->name('facilities');
    
    Route::get('/reservations', function () {
        return Inertia::render('User/Reservations');
    })->name('reservations');
    
    Route::get('/notifications', function () {
        return Inertia::render('User/Notifications');
    })->name('notifications');
    
    Route::get('/profile', function () {
        return Inertia::render('User/Profile');
    })->name('profile');
});
