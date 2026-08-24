import { api, ApiResponse, setAccessToken } from "./api";
import { AuthResponse, User } from "../types/user.types";

export async function registerRequest(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<User> {
  const response = await api.post<ApiResponse<AuthResponse>>("/auth/register", input);
  setAccessToken(response.data.data.accessToken);
  return response.data.data.user;
}

export async function loginRequest(input: { email: string; password: string }): Promise<User> {
  const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", input);
  setAccessToken(response.data.data.accessToken);
  return response.data.data.user;
}

export async function logoutRequest(): Promise<void> {
  await api.post("/auth/logout");
  setAccessToken(null);
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await api.get<ApiResponse<User>>("/users/me");
  return response.data.data;
}

export async function refreshSession(): Promise<string> {
  const response = await api.post<ApiResponse<{ accessToken: string }>>("/auth/refresh");
  const token = response.data.data.accessToken;
  setAccessToken(token);
  return token;
}