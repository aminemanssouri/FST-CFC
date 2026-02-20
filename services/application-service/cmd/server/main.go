package main

import (
	"log"

	"github.com/aminemanssouri/FST-CFC/services/application-service/internal/config"
	"github.com/aminemanssouri/FST-CFC/services/application-service/internal/handler"
	"github.com/aminemanssouri/FST-CFC/services/application-service/internal/model"
	"github.com/aminemanssouri/FST-CFC/services/application-service/internal/repository"
	"github.com/aminemanssouri/FST-CFC/services/application-service/internal/router"
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
	if err := db.AutoMigrate(
		&model.Application{},
		&model.Decision{},
		&model.ApplicationHistory{},
	); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	log.Println("database connected and migrated")

	// Repositories
	appRepo := repository.NewApplicationRepository(db)

	// Handlers
	appHandler := handler.NewApplicationHandler(appRepo)

	// Router
	r := gin.Default()
	router.Setup(r, appHandler)

	// Start server
	log.Printf("application-service starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
