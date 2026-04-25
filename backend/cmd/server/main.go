package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/An2412/super-private-dashboard/backend/internal/auth"
	"github.com/An2412/super-private-dashboard/backend/internal/handler"
	mw "github.com/An2412/super-private-dashboard/backend/internal/middleware"
	"github.com/An2412/super-private-dashboard/backend/internal/repository"
	"github.com/An2412/super-private-dashboard/backend/internal/service"
	"github.com/An2412/super-private-dashboard/backend/pkg/db"
	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
)

func main() {
	port := envOrDefault("PORT", "8080")
	dbURL := envOrDefault("DATABASE_URL", "postgres://dashboard:dashboard@localhost:5432/dashboard?sslmode=disable")
	jwtSecret := envOrDefault("JWT_SECRET", "change-me-in-production-super-secret-key-2024")
	corsOrigins := []string{"*"}

	// Database
	database, err := db.Connect(dbURL)
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}
	defer database.Close()

	if err := db.Migrate(database); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	// Dependencies
	jwtManager := auth.NewJWTManager(jwtSecret, 72)
	userRepo := repository.NewUserRepo(database)
	dataRepo := repository.NewDataRepo(database)
	hub := service.NewHub()
	go hub.Run()

	// Handlers
	authHandler := handler.NewAuthHandler(userRepo, jwtManager)
	syncHandler := handler.NewSyncHandler(dataRepo, hub)
	userHandler := handler.NewUserHandler(userRepo)
	wsHandler := handler.NewWSHandler(hub, jwtManager)

	// Router
	r := chi.NewRouter()
	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	r.Use(chimw.RealIP)
	r.Use(mw.CORS(corsOrigins))
	r.Use(mw.RateLimit(100))

	// Public routes
	r.Post("/api/register", authHandler.Register)
	r.Post("/api/login", authHandler.Login)

	// Health check
	r.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(mw.AuthRequired(jwtManager))
		r.Get("/api/sync", syncHandler.GetSync)
		r.Post("/api/sync", syncHandler.PostSync)
		r.Delete("/api/user", userHandler.DeleteUser)
	})

	// WebSocket
	r.Get("/ws", wsHandler.ServeWS)

	// Serve frontend static files
	fs := http.FileServer(http.Dir("../"))
	r.Handle("/*", http.StripPrefix("/", fs))

	log.Printf("Server starting on :%s", port)
	if err := http.ListenAndServe(fmt.Sprintf(":%s", port), r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

func envOrDefault(key, defaultVal string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultVal
}
