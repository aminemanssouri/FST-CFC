package model

import (
	"time"

	"gorm.io/gorm"
)

// EtatFormation represents the lifecycle state of a program.
type EtatFormation string

const (
	EtatBrouillon EtatFormation = "BROUILLON"
	EtatPubliee   EtatFormation = "PUBLIEE"
	EtatArchivee  EtatFormation = "ARCHIVEE"
)

// Formation represents a training program (formation continue).
type Formation struct {
	ID                   uint           `json:"id" gorm:"primaryKey"`
	EtablissementID      string         `json:"etablissement_id" gorm:"type:varchar(100);not null;index"`
	CoordinateurID       string         `json:"coordinateur_id" gorm:"type:varchar(100);not null;index"`
	Titre                string         `json:"titre" gorm:"type:varchar(255);not null"`
	Description          string         `json:"description" gorm:"type:text"`
	Etat                 EtatFormation  `json:"etat" gorm:"type:varchar(20);not null;default:'BROUILLON';index"`
	DateOuverture        *time.Time     `json:"date_ouverture" gorm:"type:timestamptz"`
	DateFermeture        *time.Time     `json:"date_fermeture" gorm:"type:timestamptz"`
	InscriptionsOuvertes bool           `json:"inscriptions_ouvertes" gorm:"default:false"`
	CreatedAt            time.Time      `json:"created_at"`
	UpdatedAt            time.Time      `json:"updated_at"`
	DeletedAt            gorm.DeletedAt `json:"-" gorm:"index"`
}
