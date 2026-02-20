package repository

import (
	"github.com/aminemanssouri/FST-CFC/services/program-service/internal/model"
	"gorm.io/gorm"
)

// RegistrationWindowRepository handles database operations for registration windows.
type RegistrationWindowRepository struct {
	db *gorm.DB
}

// NewRegistrationWindowRepository creates a new RegistrationWindowRepository.
func NewRegistrationWindowRepository(db *gorm.DB) *RegistrationWindowRepository {
	return &RegistrationWindowRepository{db: db}
}

// FindByProgramID returns all registration windows for a given program.
func (r *RegistrationWindowRepository) FindByProgramID(programID uint) ([]model.RegistrationWindow, error) {
	var windows []model.RegistrationWindow
	err := r.db.Where("program_id = ?", programID).Find(&windows).Error
	return windows, err
}

// FindByID returns a registration window by its ID.
func (r *RegistrationWindowRepository) FindByID(id uint) (*model.RegistrationWindow, error) {
	var window model.RegistrationWindow
	err := r.db.First(&window, id).Error
	if err != nil {
		return nil, err
	}
	return &window, nil
}

// Create inserts a new registration window.
func (r *RegistrationWindowRepository) Create(window *model.RegistrationWindow) error {
	return r.db.Create(window).Error
}

// Update saves changes to an existing registration window.
func (r *RegistrationWindowRepository) Update(window *model.RegistrationWindow) error {
	return r.db.Save(window).Error
}

// Delete removes a registration window.
func (r *RegistrationWindowRepository) Delete(id uint) error {
	return r.db.Delete(&model.RegistrationWindow{}, id).Error
}
