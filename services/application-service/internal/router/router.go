package router

import (
	"github.com/aminemanssouri/FST-CFC/services/application-service/internal/handler"
	"github.com/gin-gonic/gin"
)

// Setup configures all routes for the application service.
func Setup(r *gin.Engine, ah *handler.ApplicationHandler) {
	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Applications
	apps := r.Group("/applications")
	{
		apps.GET("", ah.List)
		apps.GET("/:id", ah.Get)
		apps.POST("", ah.Create)
		apps.PATCH("/:id/transition", ah.Transition)
	}
}
