package router

import (
	"github.com/aminemanssouri/FST-CFC/services/program-service/internal/handler"
	"github.com/gin-gonic/gin"
)

// Setup configures all routes for the program service.
func Setup(r *gin.Engine, ph *handler.ProgramHandler, rwh *handler.RegistrationWindowHandler) {
	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Programs
	programs := r.Group("/programs")
	{
		programs.GET("", ph.List)
		programs.GET("/:id", ph.Get)
		programs.POST("", ph.Create)
		programs.PUT("/:id", ph.Update)
		programs.DELETE("/:id", ph.Delete)
		programs.PATCH("/:id/publish", ph.Publish)
		programs.PATCH("/:id/archive", ph.Archive)

		// Registration windows (nested under programs)
		programs.GET("/:programId/windows", rwh.ListByProgram)
		programs.POST("/:programId/windows", rwh.Create)
	}

	// Registration windows (direct)
	windows := r.Group("/windows")
	{
		windows.PUT("/:id", rwh.Update)
		windows.DELETE("/:id", rwh.Delete)
	}
}
