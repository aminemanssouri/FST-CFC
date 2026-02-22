package main

import (
	"log"
	"time"

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

	// Connect to PostgreSQL with retry
	var db *gorm.DB
	var err error
	for i := 1; i <= 10; i++ {
		db, err = gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{})
		if err == nil {
			break
		}
		log.Printf("attempt %d: waiting for database... (%v)", i, err)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		log.Fatalf("failed to connect to database after retries: %v", err)
	}

	// Auto-migrate models
	if err := db.AutoMigrate(&model.Document{}); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	// Initialize S3 client
	s3Client := storage.NewS3Client(cfg.S3Endpoint, cfg.S3AccessKey, cfg.S3SecretKey, cfg.S3Bucket, cfg.S3UseSSL, cfg.PresignExpiryMins)

	log.Println("database connected and migrated, S3 client initialized")

	// Repository and Handler
	docRepo := repository.NewDocumentRepository(db)
	docHandler := handler.NewDocumentHandler(docRepo, s3Client)

	// Router
	r := gin.Default()
	router.Setup(r, docHandler, cfg.JWTSecret)

	// Start server
	log.Printf("document-service starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
