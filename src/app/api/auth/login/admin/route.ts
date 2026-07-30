import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { createSessionCookie } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, isTrustedOrigin } from "@/lib/request-guards";

const schema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Permintaan ditolak." }, { status: 403 });
  }

  const ip = getClientIp(request);
  const { allowed } = rateLimit(`login-admin:${ip}`, 10, 5 * 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan login. Coba lagi dalam beberapa menit." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }
  const { username, password, rememberMe } = parsed.data;

  const genericError = NextResponse.json({ error: "Username atau password salah." }, { status: 401 });

  const admin = await prisma.admin.findUnique({
    where: { username },
    include: { user: true },
  });

  if (!admin || !admin.user.isActive) return genericError;

  const validPassword = await verifyPassword(password, admin.user.passwordHash);
  if (!validPassword) {
    await prisma.activityLog.create({
      data: {
        userId: admin.userId,
        action: "LOGIN_FAILED",
        description: `Percobaan login admin gagal untuk username "${username}"`,
        ipAddress: ip,
      },
    });
    return genericError;
  }

  await createSessionCookie(
    {
      userId: admin.userId,
      role: "ADMIN",
      identifier: admin.username,
      fullName: admin.fullName,
    },
    rememberMe
  );

  await prisma.$transaction([
    prisma.user.update({ where: { id: admin.userId }, data: { lastLoginAt: new Date() } }),
    prisma.activityLog.create({
      data: {
        userId: admin.userId,
        action: "LOGIN",
        description: `Administrator "${admin.fullName}" masuk ke sistem`,
        ipAddress: ip,
      },
    }),
  ]);

  return NextResponse.json({ success: true, redirect: "/admin/dashboard" });
}
