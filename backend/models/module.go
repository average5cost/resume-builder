package models

type Module struct {
	ID        int64  `json:"id"`
	ResumeID  int64  `json:"resume_id"`
	Type      string `json:"type"`
	SortOrder int    `json:"sort_order"`
	Visible   bool   `json:"visible"`
	Data      string `json:"data"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type CreateModuleRequest struct {
	Type string `json:"type"`
}

type UpdateModuleRequest struct {
	Visible *bool   `json:"visible,omitempty"`
	Data    *string `json:"data,omitempty"`
}
