export interface User {
  id: string;
  name?: string;
  email: string;
  createdAt?: string;
  emailConfirmedAt?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name?: string;
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface UpdatePasswordPayload {
  password: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

// Resposta do login
export interface LoginResponse {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      name?: string;
    };
  };
  session: unknown;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Resposta do signup
export interface SignupResponse {
  user: {
    id: string;
    email: string;
    created_at: string;
  };
  session: null;
}

// Resposta do refresh
export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: unknown;
  session: unknown;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

