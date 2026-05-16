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

func CreateModule(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	resumeIDStr := chi.URLParam(r, "id")
	resumeID, _ := strconv.ParseInt(resumeIDStr, 10, 64)

	var req models.CreateModuleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	store.DB.Lock()
	resume := store.DB.FindResume(resumeID, userID)
	if resume == nil {
		store.DB.Unlock()
		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
		return
	}

	mod := store.DB.CreateModule(resumeID, req.Type)
	store.DB.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(mod)
}

func UpdateModule(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	modIDStr := chi.URLParam(r, "moduleId")
	modID, _ := strconv.ParseInt(modIDStr, 10, 64)

	var req models.UpdateModuleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	store.DB.Lock()
	ownerID := store.DB.FindModuleOwner(modID)
	if ownerID != userID {
		store.DB.Unlock()
		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
		return
	}

	mod := store.DB.UpdateModule(modID, req.Visible, req.Data)
	store.DB.Unlock()

	if mod == nil {
		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(mod)
}

func DeleteModule(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	modIDStr := chi.URLParam(r, "moduleId")
	modID, _ := strconv.ParseInt(modIDStr, 10, 64)

	store.DB.Lock()
	ownerID := store.DB.FindModuleOwner(modID)
	if ownerID != userID {
		store.DB.Unlock()
		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
		return
	}

	store.DB.DeleteModule(modID)
	store.DB.Unlock()

	w.WriteHeader(http.StatusNoContent)
}

func ReorderModules(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	resumeIDStr := chi.URLParam(r, "id")
	resumeID, _ := strconv.ParseInt(resumeIDStr, 10, 64)

	var req models.ReorderModulesRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	store.DB.Lock()
	resume := store.DB.FindResume(resumeID, userID)
	if resume == nil {
		store.DB.Unlock()
		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
		return
	}

	modules := store.DB.ReorderModules(resumeID, req.Order)
	store.DB.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(modules)
}
