<?php

namespace App\Http\Controllers;

use App\Models\GlobalConfiguration;
use Illuminate\Http\Request;

class ConfigurationController extends Controller
{
    /**
     * List all configurations
     * UC2: Gérer les configurations globales
     */
    public function index()
    {
        $configurations = GlobalConfiguration::all();

        return response()->json([
            'configurations' => $configurations,
        ]);
    }

    /**
     * Get a specific configuration by key
     */
    public function show(string $key)
    {
        $configuration = GlobalConfiguration::where('key', $key)->first();

        if (!$configuration) {
            return response()->json([
                'message' => 'Configuration not found',
            ], 404);
        }

        return response()->json([
            'configuration' => $configuration,
        ]);
    }

    /**
     * Create or update a configuration
     * UC2: Gérer les configurations globales
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string|max:255',
            'value' => 'required',
            'description' => 'nullable|string',
            'type' => 'nullable|string|in:string,integer,boolean,array,json',
        ]);

        $configuration = GlobalConfiguration::setValue(
            $validated['key'],
            $validated['value'],
            $validated['description'] ?? null,
            $validated['type'] ?? 'string'
        );

        return response()->json([
            'message' => 'Configuration saved successfully',
            'configuration' => $configuration,
        ], 201);
    }

    /**
     * Update a configuration
     * UC2: Gérer les configurations globales
     */
    public function update(Request $request, string $key)
    {
        $configuration = GlobalConfiguration::where('key', $key)->first();

        if (!$configuration) {
            return response()->json([
                'message' => 'Configuration not found',
            ], 404);
        }

        $validated = $request->validate([
            'value' => 'required',
            'description' => 'nullable|string',
            'type' => 'nullable|string|in:string,integer,boolean,array,json',
        ]);

        $configuration->update($validated);

        return response()->json([
            'message' => 'Configuration updated successfully',
            'configuration' => $configuration->fresh(),
        ]);
    }

    /**
     * Delete a configuration
     * UC2: Gérer les configurations globales
     */
    public function destroy(string $key)
    {
        $configuration = GlobalConfiguration::where('key', $key)->first();

        if (!$configuration) {
            return response()->json([
                'message' => 'Configuration not found',
            ], 404);
        }

        $configuration->delete();

        return response()->json([
            'message' => 'Configuration deleted successfully',
        ]);
    }
}
