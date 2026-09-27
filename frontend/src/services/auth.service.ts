import { api, setAccessToken } from "./api";
import { AuthResponse, User } from "../types/user.types";

export async function registerRequest(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<User> {
  const response = await api.post("/auth/register", input);
  const data = response.data.data as AuthResponse;
  setAccessToken(data.accessToken);
  return data.user;
}

export async function loginRequest(input: { email: string; password: string }): Promise<User> {
  const response = await api.post("/auth/login", input);
  const data = response.data.data as AuthResponse;
  setAccessToken(data.accessToken);
  return data.user;
}

export async function logoutRequest(): Promise<void> {
  await api.post("/auth/logout");
  setAccessToken(null);
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await api.get("/users/me");
  return response.data.data as User;
}

export async function refreshSession(): Promise<string> {
  const response = await api.post("/auth/refresh");
  const data = response.data.data as { accessToken: string };
  setAccessToken(data.accessToken);
  return data.accessToken;
}