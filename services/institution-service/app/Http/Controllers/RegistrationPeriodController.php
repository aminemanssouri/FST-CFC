<?php

namespace App\Http\Controllers;

use App\Models\RegistrationPeriod;
use App\Models\Formation;
use Illuminate\Http\Request;

class RegistrationPeriodController extends Controller
{
    /**
     * Get registration period for a formation
     */
    public function show(Formation $formation)
    {
        $period = $formation->registrationPeriod;

        if (!$period) {
            return response()->json([
                'message' => 'No registration period found for this formation',
            ], 404);
        }

        $period->is_currently_open = $period->isCurrentlyOpen();
        $period->has_capacity = $period->hasCapacity();

        return response()->json([
            'registration_period' => $period,
        ]);
    }

    /**
     * Create or update registration period
     * UC6: Gérer la période d'inscription (Coordinateur)
     */
    public function store(Request $request, Formation $formation)
    {
        $validated = $request->validate([
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'is_open' => 'boolean',
            'auto_close' => 'boolean',
            'max_applications' => 'nullable|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        $validated['formation_id'] = $formation->id;
        $validated['is_open'] = $validated['is_open'] ?? true;
        $validated['auto_close'] = $validated['auto_close'] ?? true;
        $validated['current_applications'] = 0;

        $period = RegistrationPeriod::updateOrCreate(
            ['formation_id' => $formation->id],
            $validated
        );

        return response()->json([
            'message' => 'Registration period saved successfully',
            'registration_period' => $period,
        ], 201);
    }

    /**
     * Update registration period
     * UC6: Gérer la période d'inscription (Coordinateur)
     */
    public function update(Request $request, Formation $formation)
    {
        $period = $formation->registrationPeriod;

        if (!$period) {
            return response()->json([
                'message' => 'No registration period found for this formation',
            ], 404);
        }

        $validated = $request->validate([
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'is_open' => 'sometimes|boolean',
            'auto_close' => 'sometimes|boolean',
            'max_applications' => 'nullable|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        $period->update($validated);

        return response()->json([
            'message' => 'Registration period updated successfully',
            'registration_period' => $period->fresh(),
        ]);
    }

    /**
     * Open registration period
     * UC6: Gérer la période d'inscription (Coordinateur)
     */
    public function open(Formation $formation)
    {
        $period = $formation->registrationPeriod;

        if (!$period) {
            return response()->json([
                'message' => 'No registration period found for this formation',
            ], 404);
        }

        $period->update(['is_open' => true]);

        return response()->json([
            'message' => 'Registration period opened successfully',
            'registration_period' => $period->fresh(),
        ]);
    }

    /**
     * Close registration period
     * UC6: Gérer la période d'inscription (Coordinateur)
     */
    public function close(Formation $formation)
    {
        $period = $formation->registrationPeriod;

        if (!$period) {
            return response()->json([
                'message' => 'No registration period found for this formation',
            ], 404);
        }

        $period->update(['is_open' => false]);

        return response()->json([
            'message' => 'Registration period closed successfully',
            'registration_period' => $period->fresh(),
        ]);
    }

    /**
     * Check if registration is open for a formation
     */
    public function checkStatus(Formation $formation)
    {
        $period = $formation->registrationPeriod;

        if (!$period) {
            return response()->json([
                'is_open' => false,
                'has_capacity' => false,
                'message' => 'No registration period configured',
            ]);
        }

        return response()->json([
            'is_open' => $period->isCurrentlyOpen(),
            'has_capacity' => $period->hasCapacity(),
            'start_date' => $period->start_date,
            'end_date' => $period->end_date,
            'current_applications' => $period->current_applications,
            'max_applications' => $period->max_applications,
        ]);
    }

    /**
     * Increment application count (called by program-application-service)
     */
    public function incrementApplications(Formation $formation)
    {
        $period = $formation->registrationPeriod;

        if (!$period) {
            return response()->json([
                'message' => 'No registration period found',
            ], 404);
        }

        $period->incrementApplications();

        return response()->json([
            'message' => 'Application count incremented',
            'current_applications' => $period->current_applications,
        ]);
    }

    /**
     * Get registration periods that should be closed (called by scheduler-job)
     * Returns formations whose registration end_date has passed and are still open.
     */
    public function registrationsToClose(Request $request)
    {
        $before = $request->query('before', now()->toISOString());
        $limit = (int) $request->query('limit', 100);

        $periods = RegistrationPeriod::where('is_open', true)
            ->where('auto_close', true)
            ->where('end_date', '<', $before)
            ->with('formation.establishment')
            ->limit($limit)
            ->get();

        $result = $periods->map(function ($period) {
            return [
                'id' => (string) $period->formation_id,
                'institutionId' => (string) $period->formation->establishment_id,
                'registrationCloseDate' => $period->end_date->toISOString(),
            ];
        });

        return response()->json($result->values());
    }

    /**
     * Close registration for a formation via scheduler (called by scheduler-job)
     */
    public function closeViaScheduler(Request $request, Formation $formation)
    {
        $period = $formation->registrationPeriod;

        if (!$period) {
            return response()->json([
                'message' => 'No registration period found',
            ], 404);
        }

        $period->update(['is_open' => false]);

        // Notify program-application-service
        try {
            $appServiceUrl = config('services.application.url', 'http://program-application-service:8000');
            \Illuminate\Support\Facades\Http::timeout(5)->post("{$appServiceUrl}/api/internal/registration-closed", [
                'formation_id' => $formation->id,
                'closed_at' => $request->input('closedAt', now()->toISOString()),
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning("Failed to notify application service: {$e->getMessage()}");
        }

        return response()->json([
            'message' => 'Registration closed successfully',
            'formation_id' => $formation->id,
            'closed_at' => $request->input('closedAt', now()->toISOString()),
        ]);
    }
}
