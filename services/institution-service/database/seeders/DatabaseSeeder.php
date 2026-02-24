<?php

namespace Database\Seeders;

use App\Models\Establishment;
use App\Models\Formation;
use App\Models\RegistrationPeriod;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a sample establishment
        $establishment = Establishment::firstOrCreate(
            ['code' => 'FST_MARRAKECH'],
            [
                'name' => 'Faculté des Sciences et Techniques - Marrakech',
                'description' => 'Faculté des Sciences et Techniques de l\'Université Cadi Ayyad',
                'city' => 'Marrakech',
                'email' => 'contact@fst.uca.ma',
                'is_active' => true,
            ]
        );

        // Create sample formations
        $formation1 = Formation::firstOrCreate(
            ['slug' => 'licence-informatique'],
            [
                'establishment_id' => $establishment->id,
                'title' => 'Licence en Informatique',
                'description' => 'Formation en informatique couvrant les fondamentaux.',
                'objectives' => [
                    'Maîtriser les langages de programmation',
                    'Comprendre les architectures des systèmes',
                ],
                'target_audience' => 'Bacheliers scientifiques et techniques',
                'prerequisites' => ['Baccalauréat scientifique'],
                'duration_hours' => 1200,
                'capacity' => 30,
                'price' => 5000.00,
                'status' => Formation::STATUS_PUBLISHED,
            ]
        );

        RegistrationPeriod::firstOrCreate(
            ['formation_id' => $formation1->id],
            [
                'start_date' => now(),
                'end_date' => now()->addMonths(2),
                'is_open' => true,
                'auto_close' => true,
                'max_applications' => 50,
                'current_applications' => 0,
            ]
        );
    }
}
