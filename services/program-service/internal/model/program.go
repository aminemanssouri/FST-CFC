package model

import (
	"time"

	"gorm.io/gorm"
)

// Program represents a higher-education formation/program.
type Program struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"type:varchar(255);not null"`
	Description string         `json:"description" gorm:"type:text"`
	Field       string         `json:"field" gorm:"type:varchar(100)"`
	Duration    int            `json:"duration" gorm:"not null;default:1"` // in semesters
	IsPublished bool           `json:"is_published" gorm:"default:false"`
	IsArchived  bool           `json:"is_archived" gorm:"default:false"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	RegistrationWindows []RegistrationWindow `json:"registration_windows,omitempty" gorm:"foreignKey:ProgramID"`
}
