package main

import (
	"log"

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

	// Connect to PostgreSQL
	db, err := gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	// Auto-migrate models
	if err := db.AutoMigrate(&model.Program{}, &model.RegistrationWindow{}); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	log.Println("database connected and migrated")

	// Repositories
	programRepo := repository.NewProgramRepository(db)
	windowRepo := repository.NewRegistrationWindowRepository(db)

	// Handlers
	programHandler := handler.NewProgramHandler(programRepo)
	windowHandler := handler.NewRegistrationWindowHandler(windowRepo)

	// Router
	r := gin.Default()
	router.Setup(r, programHandler, windowHandler)

	// Start server
	log.Printf("program-service starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
