<?php

namespace App\Http\Controllers;

use App\Models\Establishment;
use App\Models\Formation;
use App\Models\RegistrationPeriod;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    /**
     * Get global statistics for reporting
     */
    public function index()
    {
        return response()->json([
            'available' => true,
            'establishments' => [
                'total' => Establishment::count(),
                'active' => Establishment::where('is_active', true)->count(),
            ],
            'formations' => [
                'total' => Formation::count(),
                'by_status' => [
                    'draft' => Formation::where('status', Formation::STATUS_DRAFT)->count(),
                    'published' => Formation::where('status', Formation::STATUS_PUBLISHED)->count(),
                    'archived' => Formation::where('status', Formation::STATUS_ARCHIVED)->count(),
                ],
            ],
            'registration_periods' => [
                'total' => RegistrationPeriod::count(),
                'open' => RegistrationPeriod::where('is_open', true)->count(),
            ],
        ]);
    }

    /**
     * Get statistics for a specific establishment
     */
    public function byEstablishment(int $establishmentId)
    {
        $establishment = Establishment::find($establishmentId);

        if (!$establishment) {
            return response()->json([
                'message' => 'Establishment not found',
            ], 404);
        }

        $formations = Formation::byEstablishment($establishmentId);

        return response()->json([
            'establishment_id' => $establishmentId,
            'establishment_name' => $establishment->name,
            'formations' => [
                'total' => $formations->count(),
                'by_status' => [
                    'draft' => (clone $formations)->where('status', Formation::STATUS_DRAFT)->count(),
                    'published' => (clone $formations)->where('status', Formation::STATUS_PUBLISHED)->count(),
                    'archived' => (clone $formations)->where('status', Formation::STATUS_ARCHIVED)->count(),
                ],
            ],
        ]);
    }
}
