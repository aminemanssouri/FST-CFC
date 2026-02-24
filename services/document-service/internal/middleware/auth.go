package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Claims represents the JWT claims extracted from the token issued by the Auth Service (Laravel).
type Claims struct {
	UserID        string `json:"user_id"`
	Role          string `json:"role"`
	InstitutionID string `json:"institution_id,omitempty"`
	jwt.RegisteredClaims
}

// AuthMiddleware validates the JWT token and injects claims into the Gin context.
func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "token manquant"})
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "format Authorization invalide"})
			return
		}

		tokenStr := parts[1]
		claims := &Claims{}

		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "token invalide"})
			return
		}

		// Inject claims into context for handlers
		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)
		c.Set("institution_id", claims.InstitutionID)

		c.Next()
	}
}

// RequireRole returns middleware that restricts access to specific roles.
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "rôle non trouvé"})
			return
		}

		roleStr, ok := role.(string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "rôle invalide"})
			return
		}

		// SUPER_ADMIN bypasses all role checks
		if roleStr == "SUPER_ADMIN" {
			c.Next()
			return
		}

		for _, allowed := range allowedRoles {
			if roleStr == allowed {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
			"error":     "accès refusé",
			"role":      roleStr,
			"autorisés": allowedRoles,
		})
	}
}
