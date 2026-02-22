package repository

import (
	"github.com/aminemanssouri/FST-CFC/services/program-service/internal/model"
	"gorm.io/gorm"
)

// FormationRepository handles database operations for formations.
type FormationRepository struct {
	db *gorm.DB
}

// NewFormationRepository creates a new FormationRepository.
func NewFormationRepository(db *gorm.DB) *FormationRepository {
	return &FormationRepository{db: db}
}

// FindAll returns all non-archived formations.
func (r *FormationRepository) FindAll() ([]model.Formation, error) {
	var formations []model.Formation
	err := r.db.Find(&formations).Error
	return formations, err
}

// FindByID returns a single formation by ID.
func (r *FormationRepository) FindByID(id uint) (*model.Formation, error) {
	var f model.Formation
	err := r.db.First(&f, id).Error
	if err != nil {
		return nil, err
	}
	return &f, nil
}

// FindByEtablissement returns all formations for an institution.
func (r *FormationRepository) FindByEtablissement(etablissementID string) ([]model.Formation, error) {
	var formations []model.Formation
	err := r.db.Where("etablissement_id = ?", etablissementID).Find(&formations).Error
	return formations, err
}

// FindPublished returns all published formations (catalog).
func (r *FormationRepository) FindPublished() ([]model.Formation, error) {
	var formations []model.Formation
	err := r.db.Where("etat = ?", model.EtatPubliee).Find(&formations).Error
	return formations, err
}

// Create inserts a new formation.
func (r *FormationRepository) Create(f *model.Formation) error {
	return r.db.Create(f).Error
}

// Update saves changes to an existing formation.
func (r *FormationRepository) Update(f *model.Formation) error {
	return r.db.Save(f).Error
}

// Delete soft-deletes a formation.
func (r *FormationRepository) Delete(id uint) error {
	return r.db.Delete(&model.Formation{}, id).Error
}
