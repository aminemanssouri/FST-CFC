<?php 

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EstablishmentController;
use App\Http\Controllers\FormationController;
use App\Http\Controllers\RegistrationPeriodController;
use App\Http\Controllers\StatsController;

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'service' => 'institution-service']);
});

// Public routes - UC7: Consulter le catalogue des formations
Route::get('/catalog', [FormationController::class, 'catalog']);
Route::get('/formations/{formation}', [FormationController::class, 'show']);
Route::get('/formations/{formation}/registration-status', [RegistrationPeriodController::class, 'checkStatus']);

// Stats endpoint for internal use
Route::get('/stats', [StatsController::class, 'index']);
Route::get('/stats/establishment/{establishmentId}', [StatsController::class, 'byEstablishment']);

// Protected routes
Route::middleware('auth.service:super_admin')->group(function () {
    // UC1: Gérer les établissements (Super Admin)
    Route::apiResource('establishments', EstablishmentController::class);
});

Route::middleware('auth.service:super_admin,establishment_admin')->group(function () {
    // UC4: Gérer les formations (Admin Établissement)
    Route::get('/formations', [FormationController::class, 'index']);
    Route::post('/formations', [FormationController::class, 'store']);
    Route::put('/formations/{formation}', [FormationController::class, 'update']);
    Route::delete('/formations/{formation}', [FormationController::class, 'destroy']);
    Route::post('/formations/{formation}/publish', [FormationController::class, 'publish']);
    Route::post('/formations/{formation}/archive', [FormationController::class, 'archive']);
    Route::get('/establishments/{establishmentId}/formations', [FormationController::class, 'byEstablishment']);
});

Route::middleware('auth.service:coordinator,establishment_admin,super_admin')->group(function () {
    // UC6: Gérer la période d'inscription (Coordinateur)
    Route::get('/formations/{formation}/registration-period', [RegistrationPeriodController::class, 'show']);
    Route::post('/formations/{formation}/registration-period', [RegistrationPeriodController::class, 'store']);
    Route::put('/formations/{formation}/registration-period', [RegistrationPeriodController::class, 'update']);
    Route::post('/formations/{formation}/registration-period/open', [RegistrationPeriodController::class, 'open']);
    Route::post('/formations/{formation}/registration-period/close', [RegistrationPeriodController::class, 'close']);
});

// Internal service endpoints (from program-application-service)
Route::post('/internal/formations/{formation}/increment-applications', [RegistrationPeriodController::class, 'incrementApplications']);

// Scheduler-job endpoints
Route::get('/programs/registrations-to-close', [RegistrationPeriodController::class, 'registrationsToClose']);
Route::post('/programs/{formation}/close-registrations', [RegistrationPeriodController::class, 'closeViaScheduler']);