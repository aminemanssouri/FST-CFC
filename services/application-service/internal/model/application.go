package model

import (
	"time"

	"gorm.io/gorm"
)

// ApplicationStatus represents the state of a student application.
type ApplicationStatus string

const (
	StatusDraft       ApplicationStatus = "DRAFT"
	StatusSubmitted   ApplicationStatus = "SUBMITTED"
	StatusUnderReview ApplicationStatus = "UNDER_REVIEW"
	StatusAccepted    ApplicationStatus = "ACCEPTED"
	StatusRejected    ApplicationStatus = "REJECTED"
	StatusWaitlisted  ApplicationStatus = "WAITLISTED"
)

// ValidTransitions defines which status transitions are allowed.
var ValidTransitions = map[ApplicationStatus][]ApplicationStatus{
	StatusDraft:       {StatusSubmitted},
	StatusSubmitted:   {StatusUnderReview},
	StatusUnderReview: {StatusAccepted, StatusRejected, StatusWaitlisted},
	StatusWaitlisted:  {StatusAccepted, StatusRejected},
}

// CanTransitionTo checks whether a transition from the current status to the target is allowed.
func (s ApplicationStatus) CanTransitionTo(target ApplicationStatus) bool {
	allowed, ok := ValidTransitions[s]
	if !ok {
		return false
	}
	for _, t := range allowed {
		if t == target {
			return true
		}
	}
	return false
}

// Application represents a student application (préinscription / dossier / inscription).
type Application struct {
	ID          uint              `json:"id" gorm:"primaryKey"`
	CandidateID string            `json:"candidate_id" gorm:"type:varchar(100);not null;index"`
	ProgramID   uint              `json:"program_id" gorm:"not null;index"`
	Status      ApplicationStatus `json:"status" gorm:"type:varchar(20);not null;default:'DRAFT';index"`
	FullName    string            `json:"full_name" gorm:"type:varchar(255);not null"`
	Email       string            `json:"email" gorm:"type:varchar(255);not null"`
	Phone       string            `json:"phone" gorm:"type:varchar(50)"`
	Notes       string            `json:"notes" gorm:"type:text"`
	CreatedAt   time.Time         `json:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at"`
	DeletedAt   gorm.DeletedAt    `json:"-" gorm:"index"`

	Decisions []Decision           `json:"decisions,omitempty" gorm:"foreignKey:ApplicationID"`
	History   []ApplicationHistory `json:"history,omitempty" gorm:"foreignKey:ApplicationID"`
}
