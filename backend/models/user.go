package models

type User struct {
	ID        int64  `json:"id"`
	Username  string `json:"username"`
	Password  string `json:"-"`
	CreatedAt string `json:"created_at"`
}

type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
