package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"resume-builder/handlers"
	"resume-builder/middleware"
	"resume-builder/store"

	"github.com/go-chi/chi/v5"
	chimid "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "resume-builder-secret-key-change-in-production"
	}
	middleware.JWTSecret = []byte(jwtSecret)

	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = filepath.Join("data", "resume.json")
	}
	os.MkdirAll(filepath.Dir(dbPath), 0755)
	store.Init(dbPath)
	store.DB.Lock()
	store.DB.SeedTemplates()
	store.DB.Unlock()

	r := chi.NewRouter()
	r.Use(chimid.Logger)
	r.Use(chimid.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Post("/api/auth/register", handlers.Register)
	r.Post("/api/auth/login", handlers.Login)
	r.Get("/api/templates", handlers.ListTemplates)

	r.Group(func(r chi.Router) {
		r.Use(middleware.AuthMiddleware)

		r.Get("/api/auth/me", handlers.Me)

		r.Get("/api/resumes", handlers.ListResumes)
		r.Post("/api/resumes", handlers.CreateResume)
		r.Get("/api/resumes/{id}", handlers.GetResume)
		r.Put("/api/resumes/{id}", handlers.UpdateResume)
		r.Delete("/api/resumes/{id}", handlers.DeleteResume)
		r.Put("/api/resumes/{id}/modules/reorder", handlers.ReorderModules)

		r.Post("/api/resumes/{id}/modules", handlers.CreateModule)
		r.Put("/api/modules/{moduleId}", handlers.UpdateModule)
		r.Delete("/api/modules/{moduleId}", handlers.DeleteModule)
	})

	if _, err := os.Stat("frontend-dist"); err == nil {
		fs := http.FileServer(http.Dir("frontend-dist"))
		r.Handle("/*", fs)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on 0.0.0.0:%s", port)
	http.ListenAndServe("0.0.0.0:"+port, r)
}
