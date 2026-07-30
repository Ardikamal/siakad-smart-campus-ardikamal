import "server-only";
import type { NextRequest } from "next/server";

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Defense-in-depth CSRF check for state-changing API routes. The session
 * cookie is already SameSite=Lax + HttpOnly, which blocks the classic
 * cross-site form-post attack on its own — this adds a second, independent
 * check so a single misconfiguration doesn't remove all protection.
 */
export function isTrustedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // some same-origin fetches omit Origin; SameSite cookie still applies
  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}
