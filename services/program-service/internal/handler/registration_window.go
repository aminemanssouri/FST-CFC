package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/aminemanssouri/FST-CFC/services/program-service/internal/model"
	"github.com/aminemanssouri/FST-CFC/services/program-service/internal/repository"
	"github.com/gin-gonic/gin"
)

// RegistrationWindowHandler handles HTTP requests for registration windows.
type RegistrationWindowHandler struct {
	repo *repository.RegistrationWindowRepository
}

// NewRegistrationWindowHandler creates a new RegistrationWindowHandler.
func NewRegistrationWindowHandler(repo *repository.RegistrationWindowRepository) *RegistrationWindowHandler {
	return &RegistrationWindowHandler{repo: repo}
}

// ListByProgram returns all registration windows for a given program.
func (h *RegistrationWindowHandler) ListByProgram(c *gin.Context) {
	programID, err := strconv.ParseUint(c.Param("programId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid program id"})
		return
	}

	windows, err := h.repo.FindByProgramID(uint(programID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": windows})
}

// Create inserts a new registration window for a program.
func (h *RegistrationWindowHandler) Create(c *gin.Context) {
	programID, err := strconv.ParseUint(c.Param("programId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid program id"})
		return
	}

	var input struct {
		OpenDate         string      `json:"open_date" binding:"required"`
		CloseDate        string      `json:"close_date" binding:"required"`
		MaxApplicants    int         `json:"max_applicants"`
		EligibilityRules model.JSONB `json:"eligibility_rules"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	openDate, err := time.Parse(time.RFC3339, input.OpenDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid open_date format, use RFC3339"})
		return
	}
	closeDate, err := time.Parse(time.RFC3339, input.CloseDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid close_date format, use RFC3339"})
		return
	}

	window := model.RegistrationWindow{
		ProgramID:        uint(programID),
		OpenDate:         openDate,
		CloseDate:        closeDate,
		MaxApplicants:    input.MaxApplicants,
		EligibilityRules: input.EligibilityRules,
	}

	if err := h.repo.Create(&window); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": window})
}

// Update modifies an existing registration window.
func (h *RegistrationWindowHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	window, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "registration window not found"})
		return
	}

	var input struct {
		OpenDate         *string      `json:"open_date"`
		CloseDate        *string      `json:"close_date"`
		MaxApplicants    *int         `json:"max_applicants"`
		EligibilityRules *model.JSONB `json:"eligibility_rules"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.OpenDate != nil {
		t, err := time.Parse(time.RFC3339, *input.OpenDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid open_date"})
			return
		}
		window.OpenDate = t
	}
	if input.CloseDate != nil {
		t, err := time.Parse(time.RFC3339, *input.CloseDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid close_date"})
			return
		}
		window.CloseDate = t
	}
	if input.MaxApplicants != nil {
		window.MaxApplicants = *input.MaxApplicants
	}
	if input.EligibilityRules != nil {
		window.EligibilityRules = *input.EligibilityRules
	}

	if err := h.repo.Update(window); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": window})
}

// Delete removes a registration window.
func (h *RegistrationWindowHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.repo.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "registration window deleted"})
}
