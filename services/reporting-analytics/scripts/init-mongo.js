// MongoDB initialization script
// This runs when the container first starts

// Switch to the reporting database
db = db.getSiblingDB('cfc_reporting');

// Create collections with validation
db.createCollection('enrollment_stats', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['institutionId', 'programId', 'periodStart', 'periodEnd'],
      properties: {
        institutionId: { bsonType: 'string' },
        programId: { bsonType: 'string' },
        periodStart: { bsonType: 'date' },
        periodEnd: { bsonType: 'date' },
        countPreinscription: { bsonType: 'int', minimum: 0 },
        countDossierSoumis: { bsonType: 'int', minimum: 0 },
        countEnCoursValidation: { bsonType: 'int', minimum: 0 },
        countAccepte: { bsonType: 'int', minimum: 0 },
        countRefuse: { bsonType: 'int', minimum: 0 },
        countInscrit: { bsonType: 'int', minimum: 0 }
      }
    }
  }
});

db.createCollection('program_stats', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['institutionId', 'programId', 'academicYear'],
      properties: {
        institutionId: { bsonType: 'string' },
        programId: { bsonType: 'string' },
        academicYear: { bsonType: 'string' },
        totalApplications: { bsonType: 'int', minimum: 0 },
        conversionRateToInscrit: { bsonType: 'double', minimum: 0, maximum: 1 },
        acceptanceRate: { bsonType: 'double', minimum: 0, maximum: 1 }
      }
    }
  }
});

// Create indexes for better query performance
db.enrollment_stats.createIndex({ institutionId: 1, programId: 1 });
db.enrollment_stats.createIndex({ periodStart: 1, periodEnd: 1 });
db.enrollment_stats.createIndex({ institutionId: 1, periodStart: 1 });

db.program_stats.createIndex({ institutionId: 1, programId: 1 });
db.program_stats.createIndex({ academicYear: 1 });

// Insert sample data for testing
db.enrollment_stats.insertMany([
  {
    institutionId: 'inst-demo',
    programId: 'prog-demo',
    periodStart: new Date('2024-01-01'),
    periodEnd: new Date('2024-12-31'),
    countPreinscription: 25,
    countDossierSoumis: 20,
    countEnCoursValidation: 12,
    countAccepte: 8,
    countRefuse: 4,
    countInscrit: 8
  },
  {
    institutionId: 'inst-demo-2',
    programId: 'prog-demo-2',
    periodStart: new Date('2024-01-01'),
    periodEnd: new Date('2024-12-31'),
    countPreinscription: 30,
    countDossierSoumis: 25,
    countEnCoursValidation: 18,
    countAccepte: 12,
    countRefuse: 6,
    countInscrit: 12
  }
]);

db.program_stats.insertMany([
  {
    institutionId: 'inst-demo',
    programId: 'prog-demo',
    academicYear: '2023-2024',
    totalApplications: 25,
    conversionRateToInscrit: 0.32,
    acceptanceRate: 0.67
  },
  {
    institutionId: 'inst-demo-2',
    programId: 'prog-demo-2',
    academicYear: '2023-2024',
    totalApplications: 30,
    conversionRateToInscrit: 0.40,
    acceptanceRate: 0.67
  }
]);

print('MongoDB initialized for CFC Reporting Analytics');
