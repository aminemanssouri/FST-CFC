package repository

import (
	"github.com/aminemanssouri/FST-CFC/services/program-service/internal/model"
	"gorm.io/gorm"
)

// ProgramRepository handles database operations for programs.
type ProgramRepository struct {
	db *gorm.DB
}

// NewProgramRepository creates a new ProgramRepository.
func NewProgramRepository(db *gorm.DB) *ProgramRepository {
	return &ProgramRepository{db: db}
}

// FindAll returns all non-archived programs.
func (r *ProgramRepository) FindAll() ([]model.Program, error) {
	var programs []model.Program
	err := r.db.Preload("RegistrationWindows").Find(&programs).Error
	return programs, err
}

// FindByID returns a program by its ID.
func (r *ProgramRepository) FindByID(id uint) (*model.Program, error) {
	var program model.Program
	err := r.db.Preload("RegistrationWindows").First(&program, id).Error
	if err != nil {
		return nil, err
	}
	return &program, nil
}

// Create inserts a new program.
func (r *ProgramRepository) Create(program *model.Program) error {
	return r.db.Create(program).Error
}

// Update saves changes to an existing program.
func (r *ProgramRepository) Update(program *model.Program) error {
	return r.db.Save(program).Error
}

// Delete soft-deletes a program.
func (r *ProgramRepository) Delete(id uint) error {
	return r.db.Delete(&model.Program{}, id).Error
}
