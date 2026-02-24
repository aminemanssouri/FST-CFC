<?php 

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ConfigurationController;
use App\Http\Controllers\ReportController;

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'service' => 'auth-service']);
});

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (requires authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Super Admin routes - UC1, UC2, UC3
    Route::middleware('role:super_admin')->group(function () {
        // UC1: Gérer les établissements et admins
        Route::apiResource('users', UserController::class);
        Route::get('/users/establishment/{establishmentId}', [UserController::class, 'byEstablishment']);

        // UC2: Gérer les configurations globales
        Route::get('/configurations', [ConfigurationController::class, 'index']);
        Route::get('/configurations/{key}', [ConfigurationController::class, 'show']);
        Route::post('/configurations', [ConfigurationController::class, 'store']);
        Route::put('/configurations/{key}', [ConfigurationController::class, 'update']);
        Route::delete('/configurations/{key}', [ConfigurationController::class, 'destroy']);

        // UC3: Consulter le reporting global
        Route::get('/reports', [ReportController::class, 'index']);
        Route::get('/reports/establishment/{establishmentId}', [ReportController::class, 'byEstablishment']);
    });

    // Internal service validation endpoint
    Route::get('/validate-token', function () {
        return response()->json(['valid' => true, 'user' => auth()->user()]);
    });
});