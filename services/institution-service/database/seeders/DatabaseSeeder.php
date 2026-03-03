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
        // ── FST Marrakech ──
        $fstMarrakech = Establishment::firstOrCreate(
            ['code' => 'FST_MARRAKECH'],
            [
                'name' => 'Faculté des Sciences et Techniques - Marrakech',
                'description' => 'Faculté des Sciences et Techniques de l\'Université Cadi Ayyad. Pôle d\'excellence en sciences, technologies et ingénierie.',
                'city' => 'Marrakech',
                'email' => 'contact@fst.uca.ma',
                'phone' => '+212 524 43 34 04',
                'address' => 'BP 549, Avenue Abdelkrim Khattabi, Guéliz, Marrakech',
                'website' => 'https://www.fstg-marrakech.ac.ma',
                'is_active' => true,
            ]
        );

        $this->seedFormation($fstMarrakech, 'licence-informatique', [
            'title' => 'Licence Professionnelle en Informatique',
            'description' => 'Formation complète en développement logiciel, bases de données, réseaux et systèmes d\'information. Prépare aux métiers de développeur, administrateur systèmes et chef de projet IT.',
            'objectives' => ['Maîtriser les langages de programmation (Java, Python, C++)', 'Concevoir et administrer des bases de données', 'Développer des applications web et mobiles', 'Gérer des projets informatiques'],
            'target_audience' => 'Titulaires d\'un Bac+2 en informatique, mathématiques ou domaine connexe',
            'prerequisites' => ['Bac+2 minimum', 'Bases en programmation'],
            'duration_hours' => 1200, 'capacity' => 30, 'price' => 5000.00,
        ]);

        $this->seedFormation($fstMarrakech, 'master-data-science', [
            'title' => 'Master Spécialisé en Data Science & IA',
            'description' => 'Formation avancée en science des données, apprentissage automatique, deep learning et intelligence artificielle appliquée. Inclut des projets en partenariat avec des entreprises.',
            'objectives' => ['Maîtriser les algorithmes de Machine Learning et Deep Learning', 'Analyser et visualiser de grands volumes de données', 'Déployer des modèles IA en production', 'Mener des projets data de bout en bout'],
            'target_audience' => 'Titulaires d\'une licence en informatique, mathématiques ou statistiques',
            'prerequisites' => ['Licence en informatique ou mathématiques', 'Bases en statistiques et Python'],
            'duration_hours' => 800, 'capacity' => 25, 'price' => 12000.00,
        ]);

        $this->seedFormation($fstMarrakech, 'certificat-cybersecurite', [
            'title' => 'Certificat Universitaire en Cybersécurité',
            'description' => 'Formation intensive en sécurité des systèmes d\'information : pentesting, cryptographie, sécurité réseau et conformité RGPD. Certification reconnue.',
            'objectives' => ['Auditer la sécurité d\'un système d\'information', 'Mettre en place des mesures de protection', 'Réagir face à un incident de sécurité', 'Maîtriser les normes ISO 27001 et RGPD'],
            'target_audience' => 'Professionnels IT et ingénieurs souhaitant se spécialiser en cybersécurité',
            'prerequisites' => ['Bac+3 en informatique ou expérience professionnelle IT', 'Connaissances réseau de base'],
            'duration_hours' => 400, 'capacity' => 20, 'price' => 8000.00,
        ]);

        // ── FST Beni Mellal ──
        $fstBeniMellal = Establishment::firstOrCreate(
            ['code' => 'FST_BENI_MELLAL'],
            [
                'name' => 'Faculté des Sciences et Techniques - Béni Mellal',
                'description' => 'FST Béni Mellal, rattachée à l\'Université Sultan Moulay Slimane. Centre de formation continue reconnu dans les domaines des sciences appliquées et technologies.',
                'city' => 'Béni Mellal',
                'email' => 'contact@fst.usms.ma',
                'phone' => '+212 523 48 51 12',
                'address' => 'Campus Universitaire Mghila, BP 523, Béni Mellal',
                'website' => 'https://www.fstbm.ac.ma',
                'is_active' => true,
            ]
        );

        $this->seedFormation($fstBeniMellal, 'lp-genie-logiciel', [
            'title' => 'Licence Professionnelle en Génie Logiciel',
            'description' => 'Formation pratique orientée vers le développement d\'applications modernes. Couvre les méthodologies agiles, le développement full-stack, le DevOps et le cloud computing.',
            'objectives' => ['Développer des applications full-stack (React, Node.js, Laravel)', 'Maîtriser les outils DevOps (Docker, CI/CD, Git)', 'Concevoir des architectures logicielles robustes', 'Travailler en méthodologie Agile/Scrum'],
            'target_audience' => 'Bac+2 en informatique, DUT ou BTS développement',
            'prerequisites' => ['Bac+2 en informatique', 'Maîtrise d\'au moins un langage de programmation'],
            'duration_hours' => 1000, 'capacity' => 35, 'price' => 4500.00,
        ]);

        $this->seedFormation($fstBeniMellal, 'master-energies-renouvelables', [
            'title' => 'Master en Énergies Renouvelables & Efficacité Énergétique',
            'description' => 'Formation spécialisée en énergie solaire, éolienne et biomasse. Inclut des travaux pratiques sur des installations réelles et des stages en entreprise dans le secteur énergétique.',
            'objectives' => ['Dimensionner des installations solaires photovoltaïques et thermiques', 'Évaluer le potentiel éolien d\'un site', 'Réaliser des audits énergétiques', 'Maîtriser la réglementation environnementale marocaine'],
            'target_audience' => 'Ingénieurs et licenciés en physique, génie électrique ou génie civil',
            'prerequisites' => ['Licence en sciences ou ingénierie', 'Bases en thermodynamique et électricité'],
            'duration_hours' => 900, 'capacity' => 25, 'price' => 15000.00,
        ]);

        $this->seedFormation($fstBeniMellal, 'certificat-gestion-projet', [
            'title' => 'Certificat en Gestion de Projet & Management',
            'description' => 'Formation courte en management de projet adaptée aux normes PMP/Prince2. Gestion d\'équipe, planification budgétaire, techniques de négociation et leadership.',
            'objectives' => ['Planifier et piloter un projet de A à Z', 'Gérer les risques et les parties prenantes', 'Utiliser les outils de gestion MS Project / Jira', 'Préparer la certification PMP'],
            'target_audience' => 'Cadres, chefs d\'équipe et professionnels souhaitant évoluer vers le management',
            'prerequisites' => ['Bac+3 minimum', '2 ans d\'expérience professionnelle recommandés'],
            'duration_hours' => 200, 'capacity' => 40, 'price' => 6000.00,
        ]);

        $this->seedFormation($fstBeniMellal, 'lp-reseaux-telecom', [
            'title' => 'Licence Professionnelle Réseaux & Télécommunications',
            'description' => 'Formation en administration réseau, télécommunications, VoIP et sécurité. Prépare aux certifications Cisco CCNA et CompTIA Network+.',
            'objectives' => ['Administrer des réseaux LAN/WAN complexes', 'Configurer des équipements Cisco et similaires', 'Déployer des solutions VoIP et de visioconférence', 'Sécuriser les infrastructures réseau'],
            'target_audience' => 'Bac+2 en informatique, réseaux ou télécommunications',
            'prerequisites' => ['Bac+2 technique', 'Bases en protocoles réseau TCP/IP'],
            'duration_hours' => 1100, 'capacity' => 30, 'price' => 5500.00,
        ]);

        // ── FST Settat ──
        $fstSettat = Establishment::firstOrCreate(
            ['code' => 'FST_SETTAT'],
            [
                'name' => 'Faculté des Sciences et Techniques - Settat',
                'description' => 'FST Settat, Université Hassan Premier. Spécialisée en formations continues dans les domaines du numérique et de la gestion.',
                'city' => 'Settat',
                'email' => 'cfc@fsts.ac.ma',
                'phone' => '+212 523 40 07 07',
                'address' => 'Km 3, Route de Casablanca, BP 577, Settat',
                'is_active' => true,
            ]
        );

        $this->seedFormation($fstSettat, 'lp-marketing-digital', [
            'title' => 'Licence Professionnelle en Marketing Digital',
            'description' => 'Formation en stratégie digitale, SEO/SEA, community management, e-commerce et analytics. Préparation aux certifications Google Ads et Meta Blueprint.',
            'objectives' => ['Élaborer une stratégie de marketing digital', 'Gérer des campagnes Google Ads et Meta Ads', 'Analyser les performances avec Google Analytics', 'Créer et gérer un site e-commerce'],
            'target_audience' => 'Bac+2 en commerce, communication ou gestion',
            'prerequisites' => ['Bac+2', 'Aisance avec les outils numériques'],
            'duration_hours' => 800, 'capacity' => 35, 'price' => 7000.00,
        ]);

        $this->seedFormation($fstSettat, 'master-finance-banque', [
            'title' => 'Master Spécialisé Finance & Banque',
            'description' => 'Formation avancée en finance d\'entreprise, marchés financiers, gestion des risques et conformité bancaire. En partenariat avec des institutions financières marocaines.',
            'objectives' => ['Analyser les états financiers et évaluer les entreprises', 'Gérer les portefeuilles et produits financiers', 'Maîtriser la gestion des risques bancaires', 'Appliquer la réglementation Bank Al-Maghrib'],
            'target_audience' => 'Licenciés en économie, gestion ou finance',
            'prerequisites' => ['Licence en économie, gestion ou finance', 'Notions de comptabilité'],
            'duration_hours' => 700, 'capacity' => 30, 'price' => 18000.00,
        ]);
    }

    /**
     * Helper: seed a formation with a registration period
     */
    private function seedFormation(Establishment $establishment, string $slug, array $data): void
    {
        $formation = Formation::firstOrCreate(
            ['slug' => $slug],
            array_merge($data, [
                'establishment_id' => $establishment->id,
                'status' => Formation::STATUS_PUBLISHED,
            ])
        );

        RegistrationPeriod::firstOrCreate(
            ['formation_id' => $formation->id],
            [
                'start_date' => now(),
                'end_date' => now()->addMonths(3),
                'is_open' => true,
                'auto_close' => true,
                'max_applications' => $data['capacity'] + 20,
                'current_applications' => 0,
            ]
        );
    }
}
