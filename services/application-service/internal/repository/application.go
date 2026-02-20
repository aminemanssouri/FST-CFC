package repository

import (
	"github.com/aminemanssouri/FST-CFC/services/application-service/internal/model"
	"gorm.io/gorm"
)

// ApplicationRepository handles database operations for applications.
type ApplicationRepository struct {
	db *gorm.DB
}

// NewApplicationRepository creates a new ApplicationRepository.
func NewApplicationRepository(db *gorm.DB) *ApplicationRepository {
	return &ApplicationRepository{db: db}
}

// FindAll returns all applications.
func (r *ApplicationRepository) FindAll() ([]model.Application, error) {
	var apps []model.Application
	err := r.db.Find(&apps).Error
	return apps, err
}

// FindByID returns an application by ID with its decisions and history.
func (r *ApplicationRepository) FindByID(id uint) (*model.Application, error) {
	var app model.Application
	err := r.db.Preload("Decisions").Preload("History").First(&app, id).Error
	if err != nil {
		return nil, err
	}
	return &app, nil
}

// FindByCandidateID returns all applications for a given candidate.
func (r *ApplicationRepository) FindByCandidateID(candidateID string) ([]model.Application, error) {
	var apps []model.Application
	err := r.db.Where("candidate_id = ?", candidateID).Find(&apps).Error
	return apps, err
}

// Create inserts a new application.
func (r *ApplicationRepository) Create(app *model.Application) error {
	return r.db.Create(app).Error
}

// Update saves changes to an existing application.
func (r *ApplicationRepository) Update(app *model.Application) error {
	return r.db.Save(app).Error
}

// CreateDecision inserts a new decision.
func (r *ApplicationRepository) CreateDecision(decision *model.Decision) error {
	return r.db.Create(decision).Error
}

// CreateHistory inserts a new history entry.
func (r *ApplicationRepository) CreateHistory(history *model.ApplicationHistory) error {
	return r.db.Create(history).Error
}
