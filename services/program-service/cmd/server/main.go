package main

import (
	"log"
	"time"

	"github.com/aminemanssouri/FST-CFC/services/program-service/internal/config"
	"github.com/aminemanssouri/FST-CFC/services/program-service/internal/handler"
	"github.com/aminemanssouri/FST-CFC/services/program-service/internal/model"
	"github.com/aminemanssouri/FST-CFC/services/program-service/internal/repository"
	"github.com/aminemanssouri/FST-CFC/services/program-service/internal/router"
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
	if err := db.AutoMigrate(&model.Formation{}); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	log.Println("database connected and migrated")

	// Repository
	formationRepo := repository.NewFormationRepository(db)

	// Handler
	formationHandler := handler.NewFormationHandler(formationRepo)

	// Router
	r := gin.Default()
	router.Setup(r, formationHandler, cfg.JWTSecret)

	// Start server
	log.Printf("program-service starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
