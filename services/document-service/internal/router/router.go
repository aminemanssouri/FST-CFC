package router

import (
	"github.com/aminemanssouri/FST-CFC/services/document-service/internal/handler"
	"github.com/aminemanssouri/FST-CFC/services/document-service/internal/middleware"
	"github.com/gin-gonic/gin"
)

// Setup configures all routes for the document service.
func Setup(r *gin.Engine, dh *handler.DocumentHandler, jwtSecret string) {
	// Health check — public
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Protected routes — require valid JWT
	auth := r.Group("/documents")
	auth.Use(middleware.AuthMiddleware(jwtSecret))
	{
		// List documents (Admin)
		auth.GET("", middleware.RequireRole("ADMIN_ETABLISSEMENT", "COORDINATEUR"), dh.List)

		// Get single document (owner or admin)
		auth.GET("/:id", dh.Get)

		// Upload document (Candidate — Sequence Diagram B)
		auth.POST("", middleware.RequireRole("CANDIDAT"), dh.Upload)

		// Download document (owner or admin)
		auth.GET("/:id/download", dh.Download)

		// Delete document (Admin only)
		auth.DELETE("/:id", middleware.RequireRole("ADMIN_ETABLISSEMENT"), dh.Delete)
	}
}
