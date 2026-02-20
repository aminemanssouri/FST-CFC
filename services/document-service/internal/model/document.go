package model

import (
	"time"

	"gorm.io/gorm"
)

// Document represents metadata for an uploaded file.
type Document struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	OwnerID     string         `json:"owner_id" gorm:"type:varchar(100);not null;index"`
	Filename    string         `json:"filename" gorm:"type:varchar(500);not null"`
	ContentType string         `json:"content_type" gorm:"type:varchar(100);not null"`
	Size        int64          `json:"size" gorm:"not null"`
	S3Key       string         `json:"s3_key" gorm:"type:varchar(1000);not null;uniqueIndex"`
	Version     int            `json:"version" gorm:"not null;default:1"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}
