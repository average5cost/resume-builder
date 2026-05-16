package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"resume-builder/middleware"
	"resume-builder/models"
	"resume-builder/store"

	"github.com/go-chi/chi/v5"
)

func ListResumes(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	store.DB.RLock()
	resumes := store.DB.ListResumes(userID)
	store.DB.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resumes)
}

func CreateResume(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	var req models.CreateResumeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}
	if req.Title == "" {
		req.Title = "未命名简历"
	}

	store.DB.Lock()
	resume := store.DB.CreateResume(userID, req.Title)
	store.DB.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resume)
}

func GetResume(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid id"}`, http.StatusBadRequest)
		return
	}

	store.DB.RLock()
	resume := store.DB.FindResume(id, userID)
	if resume == nil {
		store.DB.RUnlock()
		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
		return
	}
	modules := store.DB.ListModules(id)
	store.DB.RUnlock()

	resume.Modules = modules

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resume)
}

func UpdateResume(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	idStr := chi.URLParam(r, "id")
	id, _ := strconv.ParseInt(idStr, 10, 64)

	var req models.UpdateResumeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	store.DB.Lock()
	resume := store.DB.UpdateResume(id, userID, req.Title, req.TemplateID, req.FontScale, req.PrimaryColor, req.AccentColor)
	store.DB.Unlock()

	if resume == nil {
		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resume)
}

func DeleteResume(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	idStr := chi.URLParam(r, "id")
	id, _ := strconv.ParseInt(idStr, 10, 64)

	store.DB.Lock()
	store.DB.DeleteResume(id, userID)
	store.DB.Unlock()

	w.WriteHeader(http.StatusNoContent)
}
