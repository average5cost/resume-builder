package models

type Resume struct {
	ID           int64    `json:"id"`
	UserID       int64    `json:"user_id"`
	Title        string   `json:"title"`
	TemplateID   string   `json:"template_id"`
	FontScale    float64  `json:"font_scale"`
	PrimaryColor string   `json:"primary_color,omitempty"`
	AccentColor  string   `json:"accent_color,omitempty"`
	Modules      []Module `json:"modules,omitempty"`
	CreatedAt    string   `json:"created_at"`
	UpdatedAt    string   `json:"updated_at"`
}

type CreateResumeRequest struct {
	Title string `json:"title"`
}

type UpdateResumeRequest struct {
	Title        *string  `json:"title,omitempty"`
	TemplateID   *string  `json:"template_id,omitempty"`
	FontScale    *float64 `json:"font_scale,omitempty"`
	PrimaryColor *string  `json:"primary_color,omitempty"`
	AccentColor  *string  `json:"accent_color,omitempty"`
}

type ReorderModulesRequest struct {
	Order []int64 `json:"order"`
}
