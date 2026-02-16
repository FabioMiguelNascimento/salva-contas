import { apiClient } from "@/lib/api-client";
import type {
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  RefreshResponse,
  RefreshTokenPayload,
  RegisterPayload,
  SignupResponse,
  UpdatePasswordPayload,
  User,
} from "@/types/auth";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  code: number;
  data: T;
}

function unwrapData<T>(response: { data: ApiResponse<T> | T }): T {
  if (response.data && typeof response.data === "object" && "data" in response.data) {
    return (response.data as ApiResponse<T>).data;
  }
  return response.data as T;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", payload);
  return unwrapData(response);
}

export async function signup(payload: RegisterPayload): Promise<SignupResponse> {
  const response = await apiClient.post<ApiResponse<SignupResponse>>("/auth/signup", payload);
  return unwrapData(response);
}

export async function refreshToken(payload: RefreshTokenPayload): Promise<RefreshResponse> {
  const response = await apiClient.post<ApiResponse<RefreshResponse>>("/auth/refresh", payload);
  return unwrapData(response);
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
  await apiClient.post<ApiResponse<{ message: string }>>("/auth/forgot-password", payload);
}

export async function updatePassword(payload: UpdatePasswordPayload): Promise<void> {
  await apiClient.put<ApiResponse<{ message: string }>>("/auth/update-password", payload);
}

export async function updateProfile(payload: { name?: string; preferences?: any }): Promise<User> {
  const response = await apiClient.put<ApiResponse<User>>("/auth/update-profile", payload);
  return unwrapData(response);
}

export async function getMe(): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>("/auth/me");
  return unwrapData(response);
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } catch {
    // Ignora erros no logout - o token será removido localmente
  }
}

