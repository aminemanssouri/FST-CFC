package repository

import (
	"github.com/aminemanssouri/FST-CFC/services/document-service/internal/model"
	"gorm.io/gorm"
)

// DocumentRepository handles database operations for documents.
type DocumentRepository struct {
	db *gorm.DB
}

// NewDocumentRepository creates a new DocumentRepository.
func NewDocumentRepository(db *gorm.DB) *DocumentRepository {
	return &DocumentRepository{db: db}
}

// FindAll returns all documents.
func (r *DocumentRepository) FindAll() ([]model.Document, error) {
	var docs []model.Document
	err := r.db.Find(&docs).Error
	return docs, err
}

// FindByID returns a document by its ID.
func (r *DocumentRepository) FindByID(id uint) (*model.Document, error) {
	var doc model.Document
	err := r.db.First(&doc, id).Error
	if err != nil {
		return nil, err
	}
	return &doc, nil
}

// FindByInscriptionID returns all documents for a given inscription.
func (r *DocumentRepository) FindByInscriptionID(inscriptionID uint) ([]model.Document, error) {
	var docs []model.Document
	err := r.db.Where("inscription_id = ?", inscriptionID).Find(&docs).Error
	return docs, err
}

// Create inserts a new document record.
func (r *DocumentRepository) Create(doc *model.Document) error {
	return r.db.Create(doc).Error
}

// Update saves changes to an existing document record.
func (r *DocumentRepository) Update(doc *model.Document) error {
	return r.db.Save(doc).Error
}

// Delete soft-deletes a document record.
func (r *DocumentRepository) Delete(id uint) error {
	return r.db.Delete(&model.Document{}, id).Error
}
