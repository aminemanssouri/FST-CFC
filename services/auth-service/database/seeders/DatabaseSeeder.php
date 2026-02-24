<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\GlobalConfiguration;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create default Super Admin
        User::firstOrCreate(
            ['email' => 'admin@cfc.local'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => User::ROLE_SUPER_ADMIN,
                'is_active' => true,
            ]
        );

        // Create default global configurations
        GlobalConfiguration::setValue(
            'system_name',
            'Centre de Formation Continue (CFC)',
            'System display name',
            'string'
        );

        GlobalConfiguration::setValue(
            'max_applications_per_candidate',
            5,
            'Maximum number of active applications per candidate',
            'integer'
        );

        GlobalConfiguration::setValue(
            'allowed_document_types',
            ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
            'Allowed document types for upload',
            'array'
        );

        GlobalConfiguration::setValue(
            'max_document_size_mb',
            10,
            'Maximum document size in MB',
            'integer'
        );
    }
}
