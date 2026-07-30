import "server-only";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    "JWT_SECRET tidak ditemukan atau terlalu pendek. Set string acak minimal 32 karakter di .env (lihat .env.example)."
  );
}
const secretKey = new TextEncoder().encode(JWT_SECRET);

const SALT_ROUNDS = 12;
const DEFAULT_TTL = "8h";

export type SessionRole = "ADMIN" | "MAHASISWA";

export interface SessionPayload {
  userId: string;
  role: SessionRole;
  /** username (admin) atau NIM (mahasiswa) — dipakai untuk identifikasi di UI */
  identifier: string;
  fullName: string;
  [key: string]: unknown;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function signSession(payload: SessionPayload, expiresIn: string = DEFAULT_TTL): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
