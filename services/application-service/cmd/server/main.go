package main

import (
	"log"
	"time"

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
	if err := db.AutoMigrate(
		&model.Inscription{},
		&model.Decision{},
		&model.InscriptionHistorique{},
	); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	log.Println("database connected and migrated")

	// Repository
	inscriptionRepo := repository.NewInscriptionRepository(db)

	// Handler
	inscriptionHandler := handler.NewInscriptionHandler(inscriptionRepo)

	// Router
	r := gin.Default()
	router.Setup(r, inscriptionHandler, cfg.JWTSecret)

	// Start server
	log.Printf("application-service starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
