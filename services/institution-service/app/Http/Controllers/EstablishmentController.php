<?php

namespace App\Http\Controllers;

use App\Models\Establishment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EstablishmentController extends Controller
{
    /**
     * List all establishments
     * UC1: Gérer les établissements (Super Admin)
     */
    public function index(Request $request)
    {
        $query = Establishment::query();

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search by name or city
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $establishments = $query->orderBy('name')->paginate(15);

        return response()->json($establishments);
    }

    /**
     * Create a new establishment
     * UC1: Gérer les établissements (Super Admin)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:establishments',
            'description' => 'nullable|string',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'logo_url' => 'nullable|url|max:500',
        ]);

        // Generate code if not provided
        if (empty($validated['code'])) {
            $validated['code'] = Str::upper(Str::slug($validated['name'], '_'));
        }

        $validated['is_active'] = true;

        $establishment = Establishment::create($validated);

        return response()->json([
            'message' => 'Establishment created successfully',
            'establishment' => $establishment,
        ], 201);
    }

    /**
     * Get a single establishment
     */
    public function show(Establishment $establishment)
    {
        $establishment->load('formations');

        return response()->json([
            'establishment' => $establishment,
        ]);
    }

    /**
     * Update an establishment
     * UC1: Gérer les établissements (Super Admin)
     */
    public function update(Request $request, Establishment $establishment)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:establishments,code,' . $establishment->id,
            'description' => 'nullable|string',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'logo_url' => 'nullable|url|max:500',
            'is_active' => 'sometimes|boolean',
        ]);

        $establishment->update($validated);

        return response()->json([
            'message' => 'Establishment updated successfully',
            'establishment' => $establishment->fresh(),
        ]);
    }

    /**
     * Delete (soft delete) an establishment
     * UC1: Gérer les établissements (Super Admin)
     */
    public function destroy(Establishment $establishment)
    {
        $establishment->delete();

        return response()->json([
            'message' => 'Establishment deleted successfully',
        ]);
    }
}
