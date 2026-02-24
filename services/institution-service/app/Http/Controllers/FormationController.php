<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use App\Models\Establishment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class FormationController extends Controller
{
    /**
     * List all formations (public catalog)
     * UC7: Consulter le catalogue des formations
     */
    public function index(Request $request)
    {
        $query = Formation::with(['establishment', 'registrationPeriod']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            // By default, show only published formations for public access
            $query->published();
        }

        // Filter by establishment
        if ($request->has('establishment_id')) {
            $query->byEstablishment($request->establishment_id);
        }

        // Search by title
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        $formations = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($formations);
    }

    /**
     * Get formations catalog (public, only published with open registration)
     * UC7: Consulter le catalogue des formations
     */
    public function catalog(Request $request)
    {
        $query = Formation::with(['establishment', 'registrationPeriod'])
            ->published()
            ->whereHas('establishment', function ($q) {
                $q->active();
            });

        // Search by title or description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by establishment
        if ($request->has('establishment_id')) {
            $query->byEstablishment($request->establishment_id);
        }

        $formations = $query->orderBy('created_at', 'desc')->paginate(15);

        // Add registration status to each formation
        $formations->getCollection()->transform(function ($formation) {
            $formation->is_registration_open = $formation->isRegistrationOpen();
            return $formation;
        });

        return response()->json($formations);
    }

    /**
     * Create a new formation
     * UC4: Gérer les formations (Admin Établissement)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'establishment_id' => 'required|exists:establishments,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'objectives' => 'nullable|array',
            'target_audience' => 'nullable|string',
            'prerequisites' => 'nullable|array',
            'duration_hours' => 'nullable|integer|min:1',
            'capacity' => 'nullable|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'image_url' => 'nullable|url|max:500',
        ]);

        $validated['slug'] = Str::slug($validated['title']);
        $validated['status'] = Formation::STATUS_DRAFT;

        $formation = Formation::create($validated);

        return response()->json([
            'message' => 'Formation created successfully',
            'formation' => $formation,
        ], 201);
    }

    /**
     * Get a single formation
     */
    public function show(Formation $formation)
    {
        $formation->load(['establishment', 'registrationPeriod']);
        $formation->is_registration_open = $formation->isRegistrationOpen();

        return response()->json([
            'formation' => $formation,
        ]);
    }

    /**
     * Update a formation
     * UC4: Gérer les formations (Admin Établissement)
     */
    public function update(Request $request, Formation $formation)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'objectives' => 'nullable|array',
            'target_audience' => 'nullable|string',
            'prerequisites' => 'nullable|array',
            'duration_hours' => 'nullable|integer|min:1',
            'capacity' => 'nullable|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'image_url' => 'nullable|url|max:500',
        ]);

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $formation->update($validated);

        return response()->json([
            'message' => 'Formation updated successfully',
            'formation' => $formation->fresh(),
        ]);
    }

    /**
     * Publish a formation
     * UC4: Gérer les formations (Admin Établissement)
     */
    public function publish(Formation $formation)
    {
        if ($formation->status === Formation::STATUS_ARCHIVED) {
            return response()->json([
                'message' => 'Cannot publish an archived formation',
            ], 422);
        }

        $formation->update(['status' => Formation::STATUS_PUBLISHED]);

        return response()->json([
            'message' => 'Formation published successfully',
            'formation' => $formation->fresh(),
        ]);
    }

    /**
     * Archive a formation
     * UC4: Gérer les formations (Admin Établissement)
     */
    public function archive(Formation $formation)
    {
        $formation->update(['status' => Formation::STATUS_ARCHIVED]);

        return response()->json([
            'message' => 'Formation archived successfully',
            'formation' => $formation->fresh(),
        ]);
    }

    /**
     * Delete a formation
     * UC4: Gérer les formations (Admin Établissement)
     */
    public function destroy(Formation $formation)
    {
        $formation->delete();

        return response()->json([
            'message' => 'Formation deleted successfully',
        ]);
    }

    /**
     * Get formations by establishment
     */
    public function byEstablishment(int $establishmentId)
    {
        $formations = Formation::with(['registrationPeriod'])
            ->byEstablishment($establishmentId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'formations' => $formations,
        ]);
    }
}
