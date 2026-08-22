import { query } from "../config/database";
import { hashPassword, comparePassword } from "../utils/hash.util";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.util";
import { ApiError } from "../utils/apiError.util";

export interface UserRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  role: string;
  is_active: boolean;
}

export interface AuthResult {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

function toPublicUser(row: UserRow) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    role: row.role,
  };
}

export async function registerUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const existing = await query<UserRow>("SELECT id FROM users WHERE email = $1", [
    input.email,
  ]);
  if (existing.rows.length > 0) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);

  const result = await query<UserRow>(
    `INSERT INTO users (first_name, last_name, email, password_hash, role, is_active, is_email_verified)
     VALUES ($1, $2, $3, $4, 'customer', true, false)
     RETURNING id, first_name, last_name, email, password_hash, role, is_active`,
    [input.firstName, input.lastName, input.email, passwordHash]
  );

  const user = result.rows[0];
  const payload = { userId: user.id, email: user.email, role: user.role };

  return {
    user: toPublicUser(user),
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const result = await query<UserRow>(
    `SELECT id, first_name, last_name, email, password_hash, role, is_active
     FROM users WHERE email = $1`,
    [input.email]
  );

  const user = result.rows[0];
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (!user.is_active) {
    throw ApiError.forbidden("This account has been deactivated");
  }

  const passwordMatches = await comparePassword(input.password, user.password_hash);
  if (!passwordMatches) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const payload = { userId: user.id, email: user.email, role: user.role };

  return {
    user: toPublicUser(user),
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const result = await query<UserRow>(
    "SELECT id, email, role, is_active FROM users WHERE id = $1",
    [payload.userId]
  );
  const user = result.rows[0];
  if (!user || !user.is_active) {
    throw ApiError.unauthorized("Account no longer valid");
  }

  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return { accessToken };
}