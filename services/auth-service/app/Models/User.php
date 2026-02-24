<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    const ROLE_SUPER_ADMIN = 'super_admin';
    const ROLE_ESTABLISHMENT_ADMIN = 'establishment_admin';
    const ROLE_COORDINATOR = 'coordinator';
    const ROLE_CANDIDATE = 'candidate';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'establishment_id',
        'phone',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isEstablishmentAdmin(): bool
    {
        return $this->role === self::ROLE_ESTABLISHMENT_ADMIN;
    }

    public function isCoordinator(): bool
    {
        return $this->role === self::ROLE_COORDINATOR;
    }

    public function isCandidate(): bool
    {
        return $this->role === self::ROLE_CANDIDATE;
    }

    public static function getRoles(): array
    {
        return [
            self::ROLE_SUPER_ADMIN,
            self::ROLE_ESTABLISHMENT_ADMIN,
            self::ROLE_COORDINATOR,
            self::ROLE_CANDIDATE,
        ];
    }
}
