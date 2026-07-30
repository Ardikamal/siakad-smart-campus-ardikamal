import "server-only";
import { cookies } from "next/headers";
import { signSession, verifySession, type SessionPayload } from "@/lib/auth";

export const SESSION_COOKIE = "siakad_session";

/** Dipanggil dari API route login setelah kredensial tervalidasi. */
export async function createSessionCookie(payload: SessionPayload, rememberMe = false) {
  const expiresIn = rememberMe ? "30d" : "8h";
  const token = await signSession(payload, expiresIn);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 8,
  });
}

/** Dipakai di Server Component / Route Handler untuk membaca sesi berjalan. */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
