<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class VerifyServiceToken
{
    /**
     * Verify the token with auth-service and check roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        try {
            $response = Http::withToken($token)
                ->timeout(5)
                ->get(config('services.auth.url', 'http://auth-service:8000') . '/api/validate-token');

            if (!$response->successful()) {
                return response()->json(['message' => 'Invalid token'], 401);
            }

            $data = $response->json();
            $user = $data['user'] ?? null;

            if (!$user) {
                return response()->json(['message' => 'User not found'], 401);
            }

            // Check roles if specified
            if (!empty($roles) && !in_array($user['role'], $roles)) {
                return response()->json(['message' => 'Forbidden - Insufficient permissions'], 403);
            }

            // Attach user to request
            $request->merge(['auth_user' => $user]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Authentication service unavailable'], 503);
        }

        return $next($request);
    }
}
