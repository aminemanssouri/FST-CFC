package model

import "time"

// Decision records an admin decision on an application.
type Decision struct {
	ID            uint              `json:"id" gorm:"primaryKey"`
	ApplicationID uint              `json:"application_id" gorm:"not null;index"`
	DecidedBy     string            `json:"decided_by" gorm:"type:varchar(100);not null"`
	Status        ApplicationStatus `json:"status" gorm:"type:varchar(20);not null"`
	Comment       string            `json:"comment" gorm:"type:text"`
	CreatedAt     time.Time         `json:"created_at"`
}
