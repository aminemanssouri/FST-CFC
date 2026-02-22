package config

import (
	"fmt"
	"os"
	"strconv"
)

// Config holds all configuration for the service.
type Config struct {
	Port              string
	DBHost            string
	DBPort            string
	DBUser            string
	DBPass            string
	DBName            string
	DBSSLMode         string
	S3Endpoint        string
	S3AccessKey       string
	S3SecretKey       string
	S3Bucket          string
	S3UseSSL          bool
	PresignExpiryMins int
	JWTSecret         string
}

// Load reads configuration from environment variables.
func Load() *Config {
	useSSL, _ := strconv.ParseBool(getEnv("S3_USE_SSL", "false"))
	presignExpiry, _ := strconv.Atoi(getEnv("PRESIGN_EXPIRY_MINUTES", "15"))

	return &Config{
		Port:              getEnv("PORT", "3006"),
		DBHost:            getEnv("DB_HOST", "localhost"),
		DBPort:            getEnv("DB_PORT", "5436"),
		DBUser:            getEnv("DB_USER", "document_user"),
		DBPass:            getEnv("DB_PASSWORD", "document_pass"),
		DBName:            getEnv("DB_NAME", "document_db"),
		DBSSLMode:         getEnv("DB_SSLMODE", "disable"),
		S3Endpoint:        getEnv("S3_ENDPOINT", "localhost:9000"),
		S3AccessKey:       getEnv("S3_ACCESS_KEY", "minioadmin"),
		S3SecretKey:       getEnv("S3_SECRET_KEY", "minioadmin"),
		S3Bucket:          getEnv("S3_BUCKET", "documents"),
		S3UseSSL:          useSSL,
		PresignExpiryMins: presignExpiry,
		JWTSecret:         getEnv("JWT_SECRET", "changeme-super-secret-key"),
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
