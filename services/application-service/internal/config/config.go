package config

import (
	"fmt"
	"os"
)

// Config holds all configuration for the service.
type Config struct {
	Port      string
	DBHost    string
	DBPort    string
	DBUser    string
	DBPass    string
	DBName    string
	DBSSLMode string
}

// Load reads configuration from environment variables.
func Load() *Config {
	return &Config{
		Port:      getEnv("PORT", "3005"),
		DBHost:    getEnv("DB_HOST", "localhost"),
		DBPort:    getEnv("DB_PORT", "5435"),
		DBUser:    getEnv("DB_USER", "application_user"),
		DBPass:    getEnv("DB_PASSWORD", "application_pass"),
		DBName:    getEnv("DB_NAME", "application_db"),
		DBSSLMode: getEnv("DB_SSLMODE", "disable"),
	}
}

// DSN returns the PostgreSQL connection string.
func (c *Config) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.DBHost, c.DBPort, c.DBUser, c.DBPass, c.DBName, c.DBSSLMode,
	)
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
