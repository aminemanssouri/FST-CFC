package handler

import (
	"net/http"
	"strconv"

	"github.com/aminemanssouri/FST-CFC/services/application-service/internal/model"
	"github.com/aminemanssouri/FST-CFC/services/application-service/internal/repository"
	"github.com/gin-gonic/gin"
)

// ApplicationHandler handles HTTP requests for applications.
type ApplicationHandler struct {
	repo *repository.ApplicationRepository
}

// NewApplicationHandler creates a new ApplicationHandler.
func NewApplicationHandler(repo *repository.ApplicationRepository) *ApplicationHandler {
	return &ApplicationHandler{repo: repo}
}

// List returns all applications.
func (h *ApplicationHandler) List(c *gin.Context) {
	candidateID := c.Query("candidate_id")
	if candidateID != "" {
		apps, err := h.repo.FindByCandidateID(candidateID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": apps})
		return
	}

	apps, err := h.repo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": apps})
}

// Get returns a single application by ID with decisions and history.
func (h *ApplicationHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	app, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "application not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": app})
}

// Create inserts a new application (DRAFT status).
func (h *ApplicationHandler) Create(c *gin.Context) {
	var input struct {
		CandidateID string `json:"candidate_id" binding:"required"`
		ProgramID   uint   `json:"program_id" binding:"required"`
		FullName    string `json:"full_name" binding:"required"`
		Email       string `json:"email" binding:"required,email"`
		Phone       string `json:"phone"`
		Notes       string `json:"notes"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	app := model.Application{
		CandidateID: input.CandidateID,
		ProgramID:   input.ProgramID,
		Status:      model.StatusDraft,
		FullName:    input.FullName,
		Email:       input.Email,
		Phone:       input.Phone,
		Notes:       input.Notes,
	}

	if err := h.repo.Create(&app); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": app})
}

// Transition changes the application status according to the state machine rules.
func (h *ApplicationHandler) Transition(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var input struct {
		Status    string `json:"status" binding:"required"`
		ChangedBy string `json:"changed_by" binding:"required"`
		Comment   string `json:"comment"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	app, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "application not found"})
		return
	}

	targetStatus := model.ApplicationStatus(input.Status)

	if !app.Status.CanTransitionTo(targetStatus) {
		c.JSON(http.StatusConflict, gin.H{
			"error":          "invalid status transition",
			"current_status": app.Status,
			"target_status":  targetStatus,
			"allowed":        model.ValidTransitions[app.Status],
		})
		return
	}

	oldStatus := app.Status
	app.Status = targetStatus

	if err := h.repo.Update(app); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Record decision (for terminal or review statuses)
	if targetStatus == model.StatusAccepted || targetStatus == model.StatusRejected ||
		targetStatus == model.StatusWaitlisted || targetStatus == model.StatusUnderReview {
		decision := model.Decision{
			ApplicationID: app.ID,
			DecidedBy:     input.ChangedBy,
			Status:        targetStatus,
			Comment:       input.Comment,
		}
		_ = h.repo.CreateDecision(&decision)
	}

	// Record history
	history := model.ApplicationHistory{
		ApplicationID: app.ID,
		OldStatus:     oldStatus,
		NewStatus:     targetStatus,
		ChangedBy:     input.ChangedBy,
	}
	_ = h.repo.CreateHistory(&history)

	c.JSON(http.StatusOK, gin.H{"data": app})
}
