package handlers

import (
	"encoding/json"
	"net/http"

	"resume-builder/store"
)

func ListTemplates(w http.ResponseWriter, r *http.Request) {
	store.DB.RLock()
	templates := store.DB.ListTemplates()
	store.DB.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(templates)
}
