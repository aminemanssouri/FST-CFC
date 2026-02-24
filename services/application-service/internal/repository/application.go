package repository

import (
	"github.com/aminemanssouri/FST-CFC/services/application-service/internal/model"
	"gorm.io/gorm"
)

// InscriptionRepository handles database operations for inscriptions.
type InscriptionRepository struct {
	db *gorm.DB
}

// NewInscriptionRepository creates a new InscriptionRepository.
func NewInscriptionRepository(db *gorm.DB) *InscriptionRepository {
	return &InscriptionRepository{db: db}
}

// FindAll returns all inscriptions.
func (r *InscriptionRepository) FindAll() ([]model.Inscription, error) {
	var inscriptions []model.Inscription
	err := r.db.Find(&inscriptions).Error
	return inscriptions, err
}

// FindByID returns an inscription by ID with its decisions and history.
func (r *InscriptionRepository) FindByID(id uint) (*model.Inscription, error) {
	var ins model.Inscription
	err := r.db.Preload("Decisions").Preload("History").First(&ins, id).Error
	if err != nil {
		return nil, err
	}
	return &ins, nil
}

// FindByCandidatID returns all inscriptions for a given candidate.
func (r *InscriptionRepository) FindByCandidatID(candidatID string) ([]model.Inscription, error) {
	var inscriptions []model.Inscription
	err := r.db.Where("candidat_id = ?", candidatID).Find(&inscriptions).Error
	return inscriptions, err
}

// FindByFormationID returns all inscriptions for a given formation.
func (r *InscriptionRepository) FindByFormationID(formationID uint) ([]model.Inscription, error) {
	var inscriptions []model.Inscription
	err := r.db.Where("formation_id = ?", formationID).Find(&inscriptions).Error
	return inscriptions, err
}

// Create inserts a new inscription.
func (r *InscriptionRepository) Create(ins *model.Inscription) error {
	return r.db.Create(ins).Error
}

// Update saves changes to an existing inscription.
func (r *InscriptionRepository) Update(ins *model.Inscription) error {
	return r.db.Save(ins).Error
}

// CreateDecision inserts a new decision.
func (r *InscriptionRepository) CreateDecision(decision *model.Decision) error {
	return r.db.Create(decision).Error
}

// CreateHistory inserts a new history entry.
func (r *InscriptionRepository) CreateHistory(history *model.InscriptionHistorique) error {
	return r.db.Create(history).Error
}
