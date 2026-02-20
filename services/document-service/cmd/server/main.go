package main

import (
	"log"

	"github.com/aminemanssouri/FST-CFC/services/document-service/internal/config"
	"github.com/aminemanssouri/FST-CFC/services/document-service/internal/handler"
	"github.com/aminemanssouri/FST-CFC/services/document-service/internal/model"
	"github.com/aminemanssouri/FST-CFC/services/document-service/internal/repository"
	"github.com/aminemanssouri/FST-CFC/services/document-service/internal/router"
	"github.com/aminemanssouri/FST-CFC/services/document-service/internal/storage"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	cfg := config.Load()

	// Connect to PostgreSQL
	db, err := gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	// Auto-migrate models
	if err := db.AutoMigrate(&model.Document{}); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	log.Println("database connected and migrated")

	// S3 client
	s3Client := storage.NewS3Client(
		cfg.S3Endpoint,
		cfg.S3AccessKey,
		cfg.S3SecretKey,
		cfg.S3Bucket,
		cfg.S3UseSSL,
		cfg.PresignExpiryMins,
	)

	log.Println("S3 client initialized")

	// Repository
	docRepo := repository.NewDocumentRepository(db)

	// Handler
	docHandler := handler.NewDocumentHandler(docRepo, s3Client)

	// Router
	r := gin.Default()
	router.Setup(r, docHandler)

	// Start server
	log.Printf("document-service starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
