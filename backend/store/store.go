package store

import (
	"encoding/json"
	"os"
	"sync"
	"time"
)

type User struct {
	ID        int64  `json:"id"`
	Username  string `json:"username"`
	Password  string `json:"password"`
	CreatedAt string `json:"created_at"`
}

type Resume struct {
	ID           int64    `json:"id"`
	UserID       int64    `json:"user_id"`
	Title        string   `json:"title"`
	TemplateID   string   `json:"template_id"`
	FontScale    float64  `json:"font_scale"`
	PrimaryColor string   `json:"primary_color,omitempty"`
	AccentColor  string   `json:"accent_color,omitempty"`
	CreatedAt    string   `json:"created_at"`
	UpdatedAt    string   `json:"updated_at"`
	Modules      []Module `json:"modules,omitempty"`
}

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

type Template struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Config      string `json:"config"`
}

type StoreData struct {
	Users     []User     `json:"users"`
	Resumes   []Resume   `json:"resumes"`
	Modules   []Module   `json:"modules"`
	Templates []Template `json:"templates"`
	NextID    int64      `json:"next_id"`
}

type Store struct {
	mu   sync.RWMutex
	path string
	data StoreData
}

var DB *Store

func Init(path string) {
	DB = &Store{path: path}
	DB.data.NextID = 1
	if data, err := os.ReadFile(path); err == nil {
		json.Unmarshal(data, &DB.data)
	}
}

func (s *Store) NextID() int64 {
	id := s.data.NextID
	s.data.NextID++
	return id
}

func (s *Store) Save() {
	s.data.NextID = s.data.NextID // ensure it's set
	data, _ := json.MarshalIndent(s.data, "", "  ")
	os.WriteFile(s.path, data, 0644)
}

func (s *Store) Lock()   { s.mu.Lock() }
func (s *Store) Unlock() { s.mu.Unlock() }
func (s *Store) RLock()  { s.mu.RLock() }
func (s *Store) RUnlock() { s.mu.RUnlock() }

func now() string { return time.Now().Format(time.RFC3339) }

// User operations
func (s *Store) FindUserByUsername(username string) (*User, int) {
	for i, u := range s.data.Users {
		if u.Username == username {
			return &s.data.Users[i], i
		}
	}
	return nil, -1
}

func (s *Store) FindUserByID(id int64) *User {
	for i, u := range s.data.Users {
		if u.ID == id {
			return &s.data.Users[i]
		}
	}
	return nil
}

func (s *Store) CreateUser(username, password string) *User {
	id := s.NextID()
	s.data.Users = append(s.data.Users, User{
		ID: id, Username: username, Password: password, CreatedAt: now(),
	})
	s.Save()
	return s.FindUserByID(id)
}

// Resume operations
func (s *Store) ListResumes(userID int64) []Resume {
	var result []Resume
	for _, r := range s.data.Resumes {
		if r.UserID == userID {
			result = append(result, r)
		}
	}
	if result == nil {
		result = []Resume{}
	}
	return result
}

func (s *Store) FindResume(id, userID int64) *Resume {
	for i, r := range s.data.Resumes {
		if r.ID == id && r.UserID == userID {
			return &s.data.Resumes[i]
		}
	}
	return nil
}

func (s *Store) CreateResume(userID int64, title string) *Resume {
	id := s.NextID()
	n := now()
	s.data.Resumes = append(s.data.Resumes, Resume{
		ID: id, UserID: userID, Title: title, TemplateID: "classic", FontScale: 1.0,
		CreatedAt: n, UpdatedAt: n,
	})
	s.Save()
	r := s.FindResume(id, userID)
	if r != nil {
		return r
	}
	return &Resume{ID: id, UserID: userID, Title: title, TemplateID: "classic", FontScale: 1.0, CreatedAt: n, UpdatedAt: n}
}

func (s *Store) UpdateResume(id, userID int64, title, templateID *string, fontScale *float64, primaryColor, accentColor *string) *Resume {
	for i, r := range s.data.Resumes {
		if r.ID == id && r.UserID == userID {
			if title != nil {
				s.data.Resumes[i].Title = *title
			}
			if templateID != nil {
				s.data.Resumes[i].TemplateID = *templateID
			}
			if fontScale != nil {
				s.data.Resumes[i].FontScale = *fontScale
			}
			if primaryColor != nil {
				s.data.Resumes[i].PrimaryColor = *primaryColor
			}
			if accentColor != nil {
				s.data.Resumes[i].AccentColor = *accentColor
			}
			s.data.Resumes[i].UpdatedAt = now()
			s.Save()
			return &s.data.Resumes[i]
		}
	}
	return nil
}

func (s *Store) DeleteResume(id, userID int64) {
	// delete modules belonging to this resume
	var filteredModules []Module
	for _, m := range s.data.Modules {
		if m.ResumeID != id {
			filteredModules = append(filteredModules, m)
		}
	}
	s.data.Modules = filteredModules

	var filteredResumes []Resume
	for _, r := range s.data.Resumes {
		if !(r.ID == id && r.UserID == userID) {
			filteredResumes = append(filteredResumes, r)
		}
	}
	s.data.Resumes = filteredResumes
	s.Save()
}

// Module operations
func (s *Store) ListModules(resumeID int64) []Module {
	var result []Module
	for _, m := range s.data.Modules {
		if m.ResumeID == resumeID {
			result = append(result, m)
		}
	}
	if result == nil {
		result = []Module{}
	}
	return result
}

func (s *Store) FindModule(id int64) *Module {
	for i, m := range s.data.Modules {
		if m.ID == id {
			return &s.data.Modules[i]
		}
	}
	return nil
}

func (s *Store) FindModuleByID(id int64) *Module {
	for i, m := range s.data.Modules {
		if m.ID == id {
			return &s.data.Modules[i]
		}
	}
	return nil
}

func (s *Store) MaxSortOrder(resumeID int64) int {
	max := -1
	for _, m := range s.data.Modules {
		if m.ResumeID == resumeID && m.SortOrder > max {
			max = m.SortOrder
		}
	}
	return max
}

func (s *Store) CreateModule(resumeID int64, modType string) *Module {
	id := s.NextID()
	maxSort := s.MaxSortOrder(resumeID)
	n := now()
	s.data.Modules = append(s.data.Modules, Module{
		ID: id, ResumeID: resumeID, Type: modType, SortOrder: maxSort + 1,
		Visible: true, Data: "{}", CreatedAt: n, UpdatedAt: n,
	})
	s.Save()
	return s.FindModuleByID(id)
}

func (s *Store) UpdateModule(id int64, visible *bool, data *string) *Module {
	for i, m := range s.data.Modules {
		if m.ID == id {
			if visible != nil {
				s.data.Modules[i].Visible = *visible
			}
			if data != nil {
				s.data.Modules[i].Data = *data
			}
			s.data.Modules[i].UpdatedAt = now()
			s.Save()
			return &s.data.Modules[i]
		}
	}
	return nil
}

func (s *Store) DeleteModule(id int64) {
	var filtered []Module
	for _, m := range s.data.Modules {
		if m.ID != id {
			filtered = append(filtered, m)
		}
	}
	s.data.Modules = filtered
	s.Save()
}

func (s *Store) ReorderModules(resumeID int64, order []int64) []Module {
	for i, modID := range order {
		for j, m := range s.data.Modules {
			if m.ID == modID && m.ResumeID == resumeID {
				s.data.Modules[j].SortOrder = i
			}
		}
	}
	s.Save()
	return s.ListModules(resumeID)
}

// Template operations
func (s *Store) ListTemplates() []Template {
	return s.data.Templates
}

func (s *Store) SeedTemplates() {
	if len(s.data.Templates) > 0 {
		return
	}
	s.data.Templates = []Template{
		{ID: "classic", Name: "经典模板", Description: "传统排版，适合大多数求职场景",
			Config: `{"primary":"#2c3e50","accent":"#2980b9","bg":"#ffffff","text":"#333333","fontHeading":"Georgia,serif","fontBody":"Microsoft YaHei,sans-serif"}`},
		{ID: "modern", Name: "现代模板", Description: "简洁现代，适合互联网行业",
			Config: `{"primary":"#1a1a2e","accent":"#e94560","bg":"#ffffff","text":"#333333","fontHeading":"Helvetica,Arial,sans-serif","fontBody":"Microsoft YaHei,sans-serif"}`},
		{ID: "minimal", Name: "简约模板", Description: "极简风格，适合设计类岗位",
			Config: `{"primary":"#000000","accent":"#666666","bg":"#ffffff","text":"#444444","fontHeading":"Helvetica,Arial,sans-serif","fontBody":"Microsoft YaHei,sans-serif"}`},
		{ID: "professional", Name: "专业模板", Description: "两栏布局，左侧技能右侧经历，适合大多数求职场景",
			Config: `{"primary":"#1a3c5e","accent":"#2980b9","bg":"#ffffff","text":"#333333","fontHeading":"Georgia,serif","fontBody":"Microsoft YaHei,sans-serif","layout":"sidebar"}`},
	}
	s.Save()
}

// FindModuleOwner returns the user_id of the resume that owns a module
func (s *Store) FindModuleOwner(modID int64) int64 {
	for _, m := range s.data.Modules {
		if m.ID == modID {
			for _, r := range s.data.Resumes {
				if r.ID == m.ResumeID {
					return r.UserID
				}
			}
		}
	}
	return 0
}
