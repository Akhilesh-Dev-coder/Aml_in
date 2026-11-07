import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "aml_creative_studio_jwt_secret_key_minimum_32_characters_2025";
const key = new TextEncoder().encode(JWT_SECRET);

export const COOKIE_NAME = "admin_session";

export interface AdminPayload {
  username: string;
  role: "admin";
  iat?: number;
  exp?: number;
}

export async function signAdminToken(username: string): Promise<string> {
  return new SignJWT({ username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function verifyAdminCredentials(
  usernameInput: string,
  passwordInput: string
): Promise<boolean> {
  const configuredUsername = process.env.ADMIN_USERNAME || "admin@aml.in";
  const configuredPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const configuredPasswordPlain = process.env.ADMIN_PASSWORD || "admin@123";

  // Check username match
  if (usernameInput.trim() !== configuredUsername.trim()) {
    return false;
  }

  // If a hashed password is provided in ENV, use bcrypt
  if (configuredPasswordHash) {
    try {
      return await bcrypt.compare(passwordInput, configuredPasswordHash);
    } catch {
      return false;
    }
  }

  // Otherwise compare against configured plain password (for ease of initial setup)
  return passwordInput === configuredPasswordPlain;
}
