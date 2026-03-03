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

        // Admin FST Marrakech (establishment_id = 1)
        User::firstOrCreate(
            ['email' => 'admin.marrakech@cfc.local'],
            [
                'name' => 'Admin FST Marrakech',
                'password' => Hash::make('password'),
                'role' => User::ROLE_ESTABLISHMENT_ADMIN,
                'establishment_id' => 1,
                'is_active' => true,
            ]
        );

        // Admin FST Beni Mellal (establishment_id = 2)
        User::firstOrCreate(
            ['email' => 'admin.benimellal@cfc.local'],
            [
                'name' => 'Admin FST Béni Mellal',
                'password' => Hash::make('password'),
                'role' => User::ROLE_ESTABLISHMENT_ADMIN,
                'establishment_id' => 2,
                'is_active' => true,
            ]
        );

        // Coordinator FST Beni Mellal
        User::firstOrCreate(
            ['email' => 'coord.benimellal@cfc.local'],
            [
                'name' => 'Coordinateur FST Béni Mellal',
                'password' => Hash::make('password'),
                'role' => User::ROLE_COORDINATOR,
                'establishment_id' => 2,
                'is_active' => true,
            ]
        );

        // Admin FST Settat (establishment_id = 3)
        User::firstOrCreate(
            ['email' => 'admin.settat@cfc.local'],
            [
                'name' => 'Admin FST Settat',
                'password' => Hash::make('password'),
                'role' => User::ROLE_ESTABLISHMENT_ADMIN,
                'establishment_id' => 3,
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
