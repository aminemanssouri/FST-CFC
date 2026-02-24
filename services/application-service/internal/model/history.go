package model

import "time"

// InscriptionHistorique records audit log entries for inscription state changes.
type InscriptionHistorique struct {
	ID            uint            `json:"id" gorm:"primaryKey"`
	InscriptionID uint            `json:"inscription_id" gorm:"not null;index"`
	AncienEtat    EtatInscription `json:"ancien_etat" gorm:"type:varchar(20);not null"`
	NouvelEtat    EtatInscription `json:"nouvel_etat" gorm:"type:varchar(20);not null"`
	ModifiePar    string          `json:"modifie_par" gorm:"type:varchar(100);not null"`
	CreatedAt     time.Time       `json:"created_at"`
}
