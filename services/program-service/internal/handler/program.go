package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/aminemanssouri/FST-CFC/services/program-service/internal/model"
	"github.com/aminemanssouri/FST-CFC/services/program-service/internal/repository"
	"github.com/gin-gonic/gin"
)

// FormationHandler handles HTTP requests for formations.
type FormationHandler struct {
	repo *repository.FormationRepository
}

// NewFormationHandler creates a new FormationHandler.
func NewFormationHandler(repo *repository.FormationRepository) *FormationHandler {
	return &FormationHandler{repo: repo}
}

// List returns all formations, optionally filtered by etablissement_id.
func (h *FormationHandler) List(c *gin.Context) {
	etablissementID := c.Query("etablissement_id")
	if etablissementID != "" {
		formations, err := h.repo.FindByEtablissement(etablissementID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": formations})
		return
	}

	formations, err := h.repo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": formations})
}

// Catalogue returns only published formations (public endpoint for candidates).
func (h *FormationHandler) Catalogue(c *gin.Context) {
	formations, err := h.repo.FindPublished()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": formations})
}

// Get returns a single formation by ID.
func (h *FormationHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	f, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "formation not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": f})
}

// Create inserts a new formation (BROUILLON state).
func (h *FormationHandler) Create(c *gin.Context) {
	var input struct {
		EtablissementID string `json:"etablissement_id" binding:"required"`
		CoordinateurID  string `json:"coordinateur_id" binding:"required"`
		Titre           string `json:"titre" binding:"required"`
		Description     string `json:"description"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	f := model.Formation{
		EtablissementID: input.EtablissementID,
		CoordinateurID:  input.CoordinateurID,
		Titre:           input.Titre,
		Description:     input.Description,
		Etat:            model.EtatBrouillon,
	}

	if err := h.repo.Create(&f); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": f})
}

// Update modifies an existing formation.
func (h *FormationHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	f, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "formation not found"})
		return
	}

	var input struct {
		Titre       *string `json:"titre"`
		Description *string `json:"description"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Titre != nil {
		f.Titre = *input.Titre
	}
	if input.Description != nil {
		f.Description = *input.Description
	}

	if err := h.repo.Update(f); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": f})
}

// Publish transitions a formation from BROUILLON → PUBLIEE.
func (h *FormationHandler) Publish(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	f, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "formation not found"})
		return
	}

	if f.Etat != model.EtatBrouillon {
		c.JSON(http.StatusConflict, gin.H{
			"error":       "can only publish a BROUILLON formation",
			"etat_actuel": f.Etat,
		})
		return
	}

	f.Etat = model.EtatPubliee
	if err := h.repo.Update(f); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": f})
}

// Archive transitions a formation from PUBLIEE → ARCHIVEE.
func (h *FormationHandler) Archive(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	f, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "formation not found"})
		return
	}

	if f.Etat != model.EtatPubliee {
		c.JSON(http.StatusConflict, gin.H{
			"error":       "can only archive a PUBLIEE formation",
			"etat_actuel": f.Etat,
		})
		return
	}

	f.Etat = model.EtatArchivee
	f.InscriptionsOuvertes = false
	if err := h.repo.Update(f); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": f})
}

// UpdateRegistrations updates registration dates and opens/closes registrations.
// Maps to: PUT /api/programs/{id}/registrations (Sequence Diagram A)
func (h *FormationHandler) UpdateRegistrations(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	f, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "formation not found"})
		return
	}

	if f.Etat != model.EtatPubliee {
		c.JSON(http.StatusConflict, gin.H{"error": "formation must be PUBLIEE to manage registrations"})
		return
	}

	var input struct {
		DateOuverture        string `json:"date_ouverture" binding:"required"`
		DateFermeture        string `json:"date_fermeture" binding:"required"`
		InscriptionsOuvertes *bool  `json:"inscriptions_ouvertes"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	openDate, err := time.Parse(time.RFC3339, input.DateOuverture)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date_ouverture format, use RFC3339"})
		return
	}
	closeDate, err := time.Parse(time.RFC3339, input.DateFermeture)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date_fermeture format, use RFC3339"})
		return
	}

	f.DateOuverture = &openDate
	f.DateFermeture = &closeDate
	if input.InscriptionsOuvertes != nil {
		f.InscriptionsOuvertes = *input.InscriptionsOuvertes
	} else {
		f.InscriptionsOuvertes = true
	}

	if err := h.repo.Update(f); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": f})
}

// CloseRegistrations closes registrations for a formation (used by coordinator or scheduler).
func (h *FormationHandler) CloseRegistrations(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	f, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "formation not found"})
		return
	}

	f.InscriptionsOuvertes = false
	if err := h.repo.Update(f); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": f})
}

// CheckEligibility checks if a formation is open for registration (used by candidates).
func (h *FormationHandler) CheckEligibility(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	f, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "formation not found"})
		return
	}

	eligible := f.Etat == model.EtatPubliee && f.InscriptionsOuvertes
	now := time.Now()
	if f.DateOuverture != nil && now.Before(*f.DateOuverture) {
		eligible = false
	}
	if f.DateFermeture != nil && now.After(*f.DateFermeture) {
		eligible = false
	}

	c.JSON(http.StatusOK, gin.H{
		"eligible":              eligible,
		"etat":                  f.Etat,
		"inscriptions_ouvertes": f.InscriptionsOuvertes,
		"date_ouverture":        f.DateOuverture,
		"date_fermeture":        f.DateFermeture,
	})
}

// Delete soft-deletes a formation.
func (h *FormationHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.repo.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "formation deleted"})
}

// CloseExpiredRegistrations closes all formations where the closing date has passed.
// Internal endpoint for the scheduler (Sequence Diagram D).
func (h *FormationHandler) CloseExpiredRegistrations(c *gin.Context) {
	formations, err := h.repo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	closed := 0
	for _, f := range formations {
		if f.InscriptionsOuvertes && f.DateFermeture != nil && now.After(*f.DateFermeture) {
			f.InscriptionsOuvertes = false
			if err := h.repo.Update(&f); err == nil {
				closed++
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "expired registrations closed",
		"closed":  closed,
	})
}
