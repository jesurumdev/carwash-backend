export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string | null;
    role: string;
  };
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

