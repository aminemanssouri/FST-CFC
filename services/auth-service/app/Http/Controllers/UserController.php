<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * List all users (Super Admin only)
     * UC1: Gérer les établissements et admins
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Filter by establishment
        if ($request->has('establishment_id')) {
            $query->where('establishment_id', $request->establishment_id);
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($users);
    }

    /**
     * Create a new admin user (Super Admin only)
     * UC1: Gérer les établissements et admins
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in([
                User::ROLE_ESTABLISHMENT_ADMIN,
                User::ROLE_COORDINATOR,
            ])],
            'establishment_id' => 'required|integer',
            'phone' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'establishment_id' => $validated['establishment_id'],
            'phone' => $validated['phone'] ?? null,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
        ], 201);
    }

    /**
     * Get a single user
     */
    public function show(User $user)
    {
        return response()->json([
            'user' => $user,
        ]);
    }

    /**
     * Update a user
     * UC1: Gérer les établissements et admins
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|string|min:8',
            'role' => ['sometimes', Rule::in(User::getRoles())],
            'establishment_id' => 'sometimes|integer|nullable',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'sometimes|boolean',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Delete (deactivate) a user
     * UC1: Gérer les établissements et admins
     */
    public function destroy(User $user)
    {
        $user->update(['is_active' => false]);

        return response()->json([
            'message' => 'User deactivated successfully',
        ]);
    }

    /**
     * Get users by establishment
     */
    public function byEstablishment(int $establishmentId)
    {
        $users = User::where('establishment_id', $establishmentId)
            ->where('is_active', true)
            ->get();

        return response()->json([
            'users' => $users,
        ]);
    }
}
