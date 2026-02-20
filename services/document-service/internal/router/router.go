package router

import (
	"github.com/aminemanssouri/FST-CFC/services/document-service/internal/handler"
	"github.com/gin-gonic/gin"
)

// Setup configures all routes for the document service.
func Setup(r *gin.Engine, dh *handler.DocumentHandler) {
	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Documents
	docs := r.Group("/documents")
	{
		docs.GET("", dh.List)
		docs.GET("/:id", dh.Get)
		docs.POST("", dh.Upload)
		docs.GET("/:id/download", dh.Download)
		docs.DELETE("/:id", dh.Delete)
	}
}
