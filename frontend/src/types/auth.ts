export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
