package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"resume-builder/middleware"
	"resume-builder/models"
	"resume-builder/store"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

func Register(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}
	if req.Username == "" || req.Password == "" {
		http.Error(w, `{"error":"username and password required"}`, http.StatusBadRequest)
		return
	}

	store.DB.Lock()
	existing, _ := store.DB.FindUserByUsername(req.Username)
	if existing != nil {
		store.DB.Unlock()
		http.Error(w, `{"error":"username already exists"}`, http.StatusConflict)
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		store.DB.Unlock()
		http.Error(w, `{"error":"internal error"}`, http.StatusInternalServerError)
		return
	}

	user := store.DB.CreateUser(req.Username, string(hash))
	store.DB.Unlock()

	token, err := generateToken(user.ID, user.Username)
	if err != nil {
		http.Error(w, `{"error":"internal error"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models.AuthResponse{
		Token: token,
		User:  models.User{ID: user.ID, Username: user.Username},
	})
}

func Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	store.DB.RLock()
	user, _ := store.DB.FindUserByUsername(req.Username)
	store.DB.RUnlock()

	if user == nil {
		http.Error(w, `{"error":"invalid credentials"}`, http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		http.Error(w, `{"error":"invalid credentials"}`, http.StatusUnauthorized)
		return
	}

	token, err := generateToken(user.ID, user.Username)
	if err != nil {
		http.Error(w, `{"error":"internal error"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models.AuthResponse{
		Token: token,
		User:  models.User{ID: user.ID, Username: user.Username},
	})
}

func Me(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	store.DB.RLock()
	user := store.DB.FindUserByID(userID)
	store.DB.RUnlock()

	if user == nil {
		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models.User{ID: user.ID, Username: user.Username, CreatedAt: user.CreatedAt})
}

func generateToken(userID int64, username string) (string, error) {
	claims := &models.Claims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(72 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(middleware.JWTSecret)
}
