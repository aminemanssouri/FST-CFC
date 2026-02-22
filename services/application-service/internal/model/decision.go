package model

import "time"

// Decision records an admin decision on an inscription.
type Decision struct {
	ID            uint            `json:"id" gorm:"primaryKey"`
	InscriptionID uint            `json:"inscription_id" gorm:"not null;index"`
	DecidePar     string          `json:"decide_par" gorm:"type:varchar(100);not null"`
	Etat          EtatInscription `json:"etat" gorm:"type:varchar(20);not null"`
	Commentaire   string          `json:"commentaire" gorm:"type:text"`
	CreatedAt     time.Time       `json:"created_at"`
}
