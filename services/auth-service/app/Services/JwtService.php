<?php

namespace App\Services;

use App\Models\User;

class JwtService
{
    /**
     * Role mapping: Laravel role names → Go service role names.
     * Go services use uppercase French role names in JWT claims.
     */
    private const ROLE_MAP = [
        'super_admin'        => 'SUPER_ADMIN',
        'establishment_admin'=> 'ADMIN_ETABLISSEMENT',
        'coordinator'        => 'COORDINATEUR',
        'candidate'          => 'CANDIDAT',
    ];

    public static function generateToken(User $user, int $ttlMinutes = 1440): string
    {
        $secret = config('services.jwt.secret');

        $header = self::base64url(json_encode([
            'alg' => 'HS256',
            'typ' => 'JWT',
        ]));

        $now = time();
        $payload = self::base64url(json_encode([
            'user_id'        => (string) $user->id,
            'role'           => self::ROLE_MAP[$user->role] ?? $user->role,
            'institution_id' => (string) ($user->establishment_id ?? ''),
            'iat'            => $now,
            'exp'            => $now + ($ttlMinutes * 60),
            'sub'            => (string) $user->id,
        ]));

        $signature = self::base64url(
            hash_hmac('sha256', "{$header}.{$payload}", $secret, true)
        );

        return "{$header}.{$payload}.{$signature}";
    }

    private static function base64url(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
