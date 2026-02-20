package handler

import (
	"net/http"
	"strconv"

	"github.com/aminemanssouri/FST-CFC/services/program-service/internal/model"
	"github.com/aminemanssouri/FST-CFC/services/program-service/internal/repository"
	"github.com/gin-gonic/gin"
)

// ProgramHandler handles HTTP requests for programs.
type ProgramHandler struct {
	repo *repository.ProgramRepository
}

// NewProgramHandler creates a new ProgramHandler.
func NewProgramHandler(repo *repository.ProgramRepository) *ProgramHandler {
	return &ProgramHandler{repo: repo}
}

// List returns all programs.
func (h *ProgramHandler) List(c *gin.Context) {
	programs, err := h.repo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": programs})
}

// Get returns a single program by ID.
func (h *ProgramHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	program, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "program not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": program})
}

// Create inserts a new program.
func (h *ProgramHandler) Create(c *gin.Context) {
	var input struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
		Field       string `json:"field"`
		Duration    int    `json:"duration" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	program := model.Program{
		Name:        input.Name,
		Description: input.Description,
		Field:       input.Field,
		Duration:    input.Duration,
	}

	if err := h.repo.Create(&program); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": program})
}

// Update modifies an existing program.
func (h *ProgramHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	program, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "program not found"})
		return
	}

	var input struct {
		Name        *string `json:"name"`
		Description *string `json:"description"`
		Field       *string `json:"field"`
		Duration    *int    `json:"duration"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Name != nil {
		program.Name = *input.Name
	}
	if input.Description != nil {
		program.Description = *input.Description
	}
	if input.Field != nil {
		program.Field = *input.Field
	}
	if input.Duration != nil {
		program.Duration = *input.Duration
	}

	if err := h.repo.Update(program); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": program})
}

// Publish marks a program as published.
func (h *ProgramHandler) Publish(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	program, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "program not found"})
		return
	}

	program.IsPublished = true
	program.IsArchived = false

	if err := h.repo.Update(program); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": program})
}

// Archive marks a program as archived.
func (h *ProgramHandler) Archive(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	program, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "program not found"})
		return
	}

	program.IsArchived = true
	program.IsPublished = false

	if err := h.repo.Update(program); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": program})
}

// Delete soft-deletes a program.
func (h *ProgramHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.repo.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "program deleted"})
}
