<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\FacilityController as AdminFacilityController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\ReservationController as AdminReservationController;
use App\Http\Controllers\Admin\ScheduleController as AdminScheduleController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\User\DashboardController as UserDashboardController;
use App\Http\Controllers\User\FacilityController as UserFacilityController;
use App\Http\Controllers\User\NotificationController as UserNotificationController;
use App\Http\Controllers\User\ReservationController as UserReservationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Welcome / Landing page
Route::get('/', [WelcomeController::class, 'index'])->name('welcome');

// Legal Pages Routes
Route::get('/terms-of-service', function () {
    return Inertia::render('TermsOfService');
})->name('terms.show');

Route::get('/privacy-policy', function () {
    return Inertia::render('PrivacyPolicy');
})->name('privacy.show');

// Protected Admin Routes
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    Route::get('/users', [AdminUserController::class, 'index'])->name('users');
    Route::put('/users/{user}', [AdminUserController::class, 'update'])->name('users.update');
    Route::patch('/users/{user}/approve', [AdminUserController::class, 'approve'])->name('users.approve');
    Route::patch('/users/{user}/reject', [AdminUserController::class, 'reject'])->name('users.reject');
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');

    Route::get('/facilities', [AdminFacilityController::class, 'index'])->name('facilities');
    Route::post('/facilities', [AdminFacilityController::class, 'store'])->name('facilities.store');
    Route::put('/facilities/{facility}', [AdminFacilityController::class, 'update'])->name('facilities.update');
    Route::patch('/facilities/{facility}/toggle', [AdminFacilityController::class, 'toggleAvailability'])->name('facilities.toggle');
    Route::delete('/facilities/{facility}', [AdminFacilityController::class, 'destroy'])->name('facilities.destroy');

    Route::get('/reservations', [AdminReservationController::class, 'index'])->name('reservations');
    Route::post('/reservations', [AdminReservationController::class, 'store'])->name('reservations.store');
    Route::patch('/reservations/{reservation}/approve', [AdminReservationController::class, 'approve'])->name('reservations.approve');
    Route::patch('/reservations/{reservation}/reject', [AdminReservationController::class, 'reject'])->name('reservations.reject');
    Route::patch('/reservations/{reservation}/cancel', [AdminReservationController::class, 'cancel'])->name('reservations.cancel');
    Route::patch('/reservations/{reservation}/no-show', [AdminReservationController::class, 'markNoShow'])->name('reservations.no-show');

    Route::get('/schedules', [AdminScheduleController::class, 'index'])->name('schedules');
    Route::post('/schedules', [AdminScheduleController::class, 'store'])->name('schedules.store');
    Route::put('/schedules/{schedule}', [AdminScheduleController::class, 'update'])->name('schedules.update');
    Route::delete('/schedules/{schedule}', [AdminScheduleController::class, 'destroy'])->name('schedules.destroy');

    Route::get('/reports', [AdminReportController::class, 'index'])->name('reports');
    Route::get('/reports/export-csv', [AdminReportController::class, 'exportCsv'])->name('reports.export');
    Route::get('/reports/export-pdf', [AdminReportController::class, 'exportPdf'])->name('reports.export-pdf');
});

// Protected Regular User Routes (Clean Direct Paths: /dashboard, /my-reservations, /profile, /notifications)
Route::middleware(['auth', 'role:user'])->group(function () {
    Route::get('/dashboard', function () {
        return redirect('/');
    })->name('dashboard');

    Route::get('/facilities', [UserFacilityController::class, 'index'])->name('facilities');
    Route::get('/facilities/check-availability', [UserFacilityController::class, 'checkAvailability'])->name('facilities.check-availability');

    Route::get('/my-reservations', [UserReservationController::class, 'index'])->name('my-reservations');
    Route::post('/reservations', [UserReservationController::class, 'store'])->name('reservations.store');
    Route::patch('/reservations/{reservation}/cancel', [UserReservationController::class, 'cancel'])->name('reservations.cancel');

    Route::get('/notifications', [UserNotificationController::class, 'index'])->name('notifications');
    Route::patch('/notifications/{notification}/read', [UserNotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [UserNotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
