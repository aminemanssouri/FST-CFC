package handler

import (
	"net/http"
	"strconv"

	"github.com/aminemanssouri/FST-CFC/services/application-service/internal/model"
	"github.com/aminemanssouri/FST-CFC/services/application-service/internal/repository"
	"github.com/gin-gonic/gin"
)

// InscriptionHandler handles HTTP requests for inscriptions.
type InscriptionHandler struct {
	repo *repository.InscriptionRepository
}

// NewInscriptionHandler creates a new InscriptionHandler.
func NewInscriptionHandler(repo *repository.InscriptionRepository) *InscriptionHandler {
	return &InscriptionHandler{repo: repo}
}

// List returns all inscriptions, optionally filtered by candidat_id or formation_id.
func (h *InscriptionHandler) List(c *gin.Context) {
	candidatID := c.Query("candidat_id")
	if candidatID != "" {
		inscriptions, err := h.repo.FindByCandidatID(candidatID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": inscriptions})
		return
	}

	formationIDStr := c.Query("formation_id")
	if formationIDStr != "" {
		formationID, err := strconv.ParseUint(formationIDStr, 10, 32)
		if err == nil {
			inscriptions, err := h.repo.FindByFormationID(uint(formationID))
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, gin.H{"data": inscriptions})
			return
		}
	}

	inscriptions, err := h.repo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": inscriptions})
}

// Get returns a single inscription by ID with decisions and history.
func (h *InscriptionHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	ins, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "inscription not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": ins})
}

// Create inserts a new inscription (PREINSCRIPTION state).
// Maps to: Sequence Diagram B — candidate pre-registers.
func (h *InscriptionHandler) Create(c *gin.Context) {
	var input struct {
		CandidatID  string `json:"candidat_id" binding:"required"`
		FormationID uint   `json:"formation_id" binding:"required"`
		NomComplet  string `json:"nom_complet" binding:"required"`
		Email       string `json:"email" binding:"required,email"`
		Telephone   string `json:"telephone"`
		Notes       string `json:"notes"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ins := model.Inscription{
		CandidatID:  input.CandidatID,
		FormationID: input.FormationID,
		Etat:        model.EtatPreinscription,
		NomComplet:  input.NomComplet,
		Email:       input.Email,
		Telephone:   input.Telephone,
		Notes:       input.Notes,
	}

	if err := h.repo.Create(&ins); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": ins})
}

// Transition changes the inscription status according to the state machine rules.
// Maps to: State Diagram — Application Lifecycle & Sequence Diagram C.
func (h *InscriptionHandler) Transition(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var input struct {
		Etat        string `json:"etat" binding:"required"`
		ModifiePar  string `json:"modifie_par" binding:"required"`
		Commentaire string `json:"commentaire"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ins, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "inscription not found"})
		return
	}

	targetEtat := model.EtatInscription(input.Etat)

	if !ins.Etat.CanTransitionTo(targetEtat) {
		c.JSON(http.StatusConflict, gin.H{
			"error":       "transition invalide",
			"etat_actuel": ins.Etat,
			"etat_cible":  targetEtat,
			"autorise":    model.ValidTransitions[ins.Etat],
		})
		return
	}

	ancienEtat := ins.Etat
	ins.Etat = targetEtat

	if err := h.repo.Update(ins); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Record decision (for review/acceptance/rejection states)
	if targetEtat == model.EtatAccepte || targetEtat == model.EtatRefuse ||
		targetEtat == model.EtatEnValidation || targetEtat == model.EtatInscrit {
		decision := model.Decision{
			InscriptionID: ins.ID,
			DecidePar:     input.ModifiePar,
			Etat:          targetEtat,
			Commentaire:   input.Commentaire,
		}
		_ = h.repo.CreateDecision(&decision)
	}

	// Record history (audit trail)
	historique := model.InscriptionHistorique{
		InscriptionID: ins.ID,
		AncienEtat:    ancienEtat,
		NouvelEtat:    targetEtat,
		ModifiePar:    input.ModifiePar,
	}
	_ = h.repo.CreateHistory(&historique)

	c.JSON(http.StatusOK, gin.H{"data": ins})
}
