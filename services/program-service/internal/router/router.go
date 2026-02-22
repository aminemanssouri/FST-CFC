package router

import (
	"github.com/aminemanssouri/FST-CFC/services/program-service/internal/handler"
	"github.com/aminemanssouri/FST-CFC/services/program-service/internal/middleware"
	"github.com/gin-gonic/gin"
)

// Setup configures all routes for the program service.
func Setup(r *gin.Engine, fh *handler.FormationHandler, jwtSecret string) {
	// Health check — public
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Public catalogue (Candidates: Consulter le catalogue) — no auth
	r.GET("/catalogue", fh.Catalogue)

	// Protected routes — require valid JWT
	auth := r.Group("/")
	auth.Use(middleware.AuthMiddleware(jwtSecret))
	{
		// Formations CRUD (Admin Établissement)
		formations := auth.Group("/formations")
		{
			formations.GET("", fh.List)
			formations.GET("/:id", fh.Get)
			formations.POST("", middleware.RequireRole("ADMIN_ETABLISSEMENT"), fh.Create)
			formations.PUT("/:id", middleware.RequireRole("ADMIN_ETABLISSEMENT"), fh.Update)
			formations.DELETE("/:id", middleware.RequireRole("ADMIN_ETABLISSEMENT"), fh.Delete)

			// State transitions (Admin Établissement)
			formations.PATCH("/:id/publish", middleware.RequireRole("ADMIN_ETABLISSEMENT"), fh.Publish)
			formations.PATCH("/:id/archive", middleware.RequireRole("ADMIN_ETABLISSEMENT"), fh.Archive)

			// Registration management (Coordinator — Sequence Diagram A)
			formations.PUT("/:id/registrations", middleware.RequireRole("COORDINATEUR"), fh.UpdateRegistrations)
			formations.PATCH("/:id/close-registrations", middleware.RequireRole("COORDINATEUR"), fh.CloseRegistrations)

			// Eligibility check (Candidate — Sequence Diagram B)
			formations.GET("/:id/eligibility", fh.CheckEligibility)
		}
	}

	// Internal endpoint for scheduler (Sequence Diagram D) — SYSTEM role only
	internal := r.Group("/internal")
	internal.Use(middleware.AuthMiddleware(jwtSecret))
	internal.Use(middleware.RequireRole("SYSTEM"))
	{
		internal.POST("/jobs/close-registrations", fh.CloseExpiredRegistrations)
	}
}
