<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ReportController extends Controller
{
    /**
     * Get global reporting statistics
     * UC3: Consulter le reporting global
     */
    public function index(Request $request)
    {
        // User statistics from auth-service
        $userStats = $this->getUserStatistics();

        // Try to get external service statistics
        $institutionStats = $this->getInstitutionStatistics();
        $applicationStats = $this->getApplicationStatistics();

        return response()->json([
            'report_date' => now()->toISOString(),
            'users' => $userStats,
            'institutions' => $institutionStats,
            'applications' => $applicationStats,
        ]);
    }

    /**
     * Get user statistics
     */
    private function getUserStatistics(): array
    {
        return [
            'total' => User::count(),
            'active' => User::where('is_active', true)->count(),
            'by_role' => [
                'super_admin' => User::where('role', User::ROLE_SUPER_ADMIN)->count(),
                'establishment_admin' => User::where('role', User::ROLE_ESTABLISHMENT_ADMIN)->count(),
                'coordinator' => User::where('role', User::ROLE_COORDINATOR)->count(),
                'candidate' => User::where('role', User::ROLE_CANDIDATE)->count(),
            ],
            'new_this_month' => User::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];
    }

    /**
     * Get institution service statistics
     */
    private function getInstitutionStatistics(): array
    {
        try {
            $response = Http::timeout(5)->get(config('services.institution.url', 'http://institution-service:8000') . '/api/stats');
            
            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Exception $e) {
            // Service unavailable
        }

        return [
            'available' => false,
            'message' => 'Institution service statistics unavailable',
        ];
    }

    /**
     * Get application service statistics
     */
    private function getApplicationStatistics(): array
    {
        try {
            $response = Http::timeout(5)->get(config('services.application.url', 'http://program-application-service:8000') . '/api/stats');
            
            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Exception $e) {
            // Service unavailable
        }

        return [
            'available' => false,
            'message' => 'Application service statistics unavailable',
        ];
    }

    /**
     * Get statistics for a specific establishment
     */
    public function byEstablishment(int $establishmentId)
    {
        $userStats = [
            'establishment_admin' => User::where('establishment_id', $establishmentId)
                ->where('role', User::ROLE_ESTABLISHMENT_ADMIN)
                ->count(),
            'coordinator' => User::where('establishment_id', $establishmentId)
                ->where('role', User::ROLE_COORDINATOR)
                ->count(),
        ];

        return response()->json([
            'establishment_id' => $establishmentId,
            'users' => $userStats,
        ]);
    }
}
