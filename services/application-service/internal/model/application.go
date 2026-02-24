package model

import (
	"time"

	"gorm.io/gorm"
)

// EtatInscription represents the state of a student application.
type EtatInscription string

const (
	EtatPreinscription EtatInscription = "PREINSCRIPTION"
	EtatDossierSoumis  EtatInscription = "DOSSIER_SOUMIS"
	EtatEnValidation   EtatInscription = "EN_VALIDATION"
	EtatAccepte        EtatInscription = "ACCEPTE"
	EtatRefuse         EtatInscription = "REFUSE"
	EtatInscrit        EtatInscription = "INSCRIT"
)

// ValidTransitions defines which status transitions are allowed.
var ValidTransitions = map[EtatInscription][]EtatInscription{
	EtatPreinscription: {EtatDossierSoumis},
	EtatDossierSoumis:  {EtatEnValidation},
	EtatEnValidation:   {EtatAccepte, EtatRefuse},
	EtatAccepte:        {EtatInscrit},
}

// CanTransitionTo checks whether a transition from the current status to the target is allowed.
func (s EtatInscription) CanTransitionTo(target EtatInscription) bool {
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

// Inscription represents a candidate application (préinscription / dossier / inscription).
type Inscription struct {
	ID           uint            `json:"id" gorm:"primaryKey"`
	CandidatID   string          `json:"candidat_id" gorm:"type:varchar(100);not null;index"`
	FormationID  uint            `json:"formation_id" gorm:"not null;index"`
	Etat         EtatInscription `json:"etat" gorm:"type:varchar(20);not null;default:'PREINSCRIPTION';index"`
	NomComplet   string          `json:"nom_complet" gorm:"type:varchar(255);not null"`
	Email        string          `json:"email" gorm:"type:varchar(255);not null"`
	Telephone    string          `json:"telephone" gorm:"type:varchar(50)"`
	Notes        string          `json:"notes" gorm:"type:text"`
	DateCreation time.Time       `json:"date_creation" gorm:"autoCreateTime"`
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
	DeletedAt    gorm.DeletedAt  `json:"-" gorm:"index"`

	Decisions []Decision              `json:"decisions,omitempty" gorm:"foreignKey:InscriptionID"`
	History   []InscriptionHistorique `json:"history,omitempty" gorm:"foreignKey:InscriptionID"`
}
