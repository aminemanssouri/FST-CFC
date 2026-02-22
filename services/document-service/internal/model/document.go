package model

import (
	"time"

	"gorm.io/gorm"
)

// Document represents metadata for an uploaded file (linked to an inscription).
type Document struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	InscriptionID uint           `json:"inscription_id" gorm:"not null;index"`
	NomFichier    string         `json:"nom_fichier" gorm:"type:varchar(500);not null"`
	ContentType   string         `json:"content_type" gorm:"type:varchar(100);not null"`
	Size          int64          `json:"size" gorm:"not null"`
	URLStockage   string         `json:"url_stockage" gorm:"type:varchar(1000);not null"`
	Version       int            `json:"version" gorm:"not null;default:1"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`
}
