package model

import "time"

// ApplicationHistory records audit log entries for application state changes.
type ApplicationHistory struct {
	ID            uint              `json:"id" gorm:"primaryKey"`
	ApplicationID uint              `json:"application_id" gorm:"not null;index"`
	OldStatus     ApplicationStatus `json:"old_status" gorm:"type:varchar(20);not null"`
	NewStatus     ApplicationStatus `json:"new_status" gorm:"type:varchar(20);not null"`
	ChangedBy     string            `json:"changed_by" gorm:"type:varchar(100);not null"`
	CreatedAt     time.Time         `json:"created_at"`
}
