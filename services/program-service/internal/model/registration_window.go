package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

// JSONB is a helper type for storing arbitrary JSON in PostgreSQL.
type JSONB map[string]interface{}

// Value implements the driver.Valuer interface for JSONB.
func (j JSONB) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

// Scan implements the sql.Scanner interface for JSONB.
func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("failed to scan JSONB: value is not []byte")
	}
	return json.Unmarshal(bytes, j)
}

// RegistrationWindow defines the time period during which candidates can apply to a program.
type RegistrationWindow struct {
	ID               uint      `json:"id" gorm:"primaryKey"`
	ProgramID        uint      `json:"program_id" gorm:"not null;index"`
	OpenDate         time.Time `json:"open_date" gorm:"not null"`
	CloseDate        time.Time `json:"close_date" gorm:"not null"`
	MaxApplicants    int       `json:"max_applicants" gorm:"default:0"`
	EligibilityRules JSONB     `json:"eligibility_rules" gorm:"type:jsonb;default:'{}'"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`

	Program Program `json:"-" gorm:"foreignKey:ProgramID"`
}
