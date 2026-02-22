package router

import (
	"github.com/aminemanssouri/FST-CFC/services/application-service/internal/handler"
	"github.com/aminemanssouri/FST-CFC/services/application-service/internal/middleware"
	"github.com/gin-gonic/gin"
)

// Setup configures all routes for the application service.
func Setup(r *gin.Engine, ih *handler.InscriptionHandler, jwtSecret string) {
	// Health check — public
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Protected routes — require valid JWT
	auth := r.Group("/inscriptions")
	auth.Use(middleware.AuthMiddleware(jwtSecret))
	{
		// List inscriptions (Admin sees all, candidat sees own)
		auth.GET("", middleware.RequireRole("ADMIN_ETABLISSEMENT", "COORDINATEUR"), ih.List)

		// Get single inscription (owner or admin)
		auth.GET("/:id", ih.Get)

		// Create inscription (Candidate — Sequence Diagram B)
		auth.POST("", middleware.RequireRole("CANDIDAT"), ih.Create)

		// State transition (Admin — Sequence Diagram C)
		auth.PATCH("/:id/transition", middleware.RequireRole("ADMIN_ETABLISSEMENT"), ih.Transition)
	}
}
