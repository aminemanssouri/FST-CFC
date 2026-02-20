package handler

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/aminemanssouri/FST-CFC/services/document-service/internal/model"
	"github.com/aminemanssouri/FST-CFC/services/document-service/internal/repository"
	"github.com/aminemanssouri/FST-CFC/services/document-service/internal/storage"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// DocumentHandler handles HTTP requests for documents.
type DocumentHandler struct {
	repo *repository.DocumentRepository
	s3   *storage.S3Client
}

// NewDocumentHandler creates a new DocumentHandler.
func NewDocumentHandler(repo *repository.DocumentRepository, s3 *storage.S3Client) *DocumentHandler {
	return &DocumentHandler{repo: repo, s3: s3}
}

// List returns all documents, optionally filtered by owner_id.
func (h *DocumentHandler) List(c *gin.Context) {
	ownerID := c.Query("owner_id")
	if ownerID != "" {
		docs, err := h.repo.FindByOwnerID(ownerID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": docs})
		return
	}

	docs, err := h.repo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": docs})
}

// Get returns a single document by ID.
func (h *DocumentHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	doc, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "document not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": doc})
}

// Upload handles multipart file upload.
func (h *DocumentHandler) Upload(c *gin.Context) {
	ownerID := c.PostForm("owner_id")
	if ownerID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "owner_id is required"})
		return
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}
	defer file.Close()

	// Generate unique S3 key
	s3Key := fmt.Sprintf("%s/%s/%s", ownerID, uuid.New().String(), header.Filename)

	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	// Upload to S3
	if err := h.s3.Upload(c.Request.Context(), s3Key, file, header.Size, contentType); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Save metadata to DB
	doc := model.Document{
		OwnerID:     ownerID,
		Filename:    header.Filename,
		ContentType: contentType,
		Size:        header.Size,
		S3Key:       s3Key,
		Version:     1,
	}

	if err := h.repo.Create(&doc); err != nil {
		// Attempt cleanup of S3 object on DB failure
		_ = h.s3.Delete(c.Request.Context(), s3Key)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": doc})
}

// Download generates a presigned URL for downloading the document.
func (h *DocumentHandler) Download(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	doc, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "document not found"})
		return
	}

	presignedURL, err := h.s3.PresignedURL(c.Request.Context(), doc.S3Key)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"download_url": presignedURL.String(),
		"filename":     doc.Filename,
		"content_type": doc.ContentType,
	})
}

// Delete removes a document from both S3 and the database.
func (h *DocumentHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	doc, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "document not found"})
		return
	}

	// Delete from S3
	if err := h.s3.Delete(c.Request.Context(), doc.S3Key); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Delete metadata from DB
	if err := h.repo.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "document deleted"})
}
