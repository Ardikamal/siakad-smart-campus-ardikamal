import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { createSessionCookie } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, isTrustedOrigin } from "@/lib/request-guards";

const schema = z.object({
  nim: z.string().min(1, "NIM wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Permintaan ditolak." }, { status: 403 });
  }

  const ip = getClientIp(request);
  const { allowed } = rateLimit(`login-mahasiswa:${ip}`, 10, 5 * 60_000);
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
  const { nim, password, rememberMe } = parsed.data;

  const genericError = NextResponse.json({ error: "NIM atau password salah." }, { status: 401 });

  const student = await prisma.student.findUnique({
    where: { nim },
    include: { user: true },
  });

  if (!student || !student.user.isActive) return genericError;

  const validPassword = await verifyPassword(password, student.user.passwordHash);
  if (!validPassword) {
    await prisma.activityLog.create({
      data: {
        userId: student.userId,
        action: "LOGIN_FAILED",
        description: `Percobaan login mahasiswa gagal untuk NIM "${nim}"`,
        ipAddress: ip,
      },
    });
    return genericError;
  }

  await createSessionCookie(
    {
      userId: student.userId,
      role: "MAHASISWA",
      identifier: student.nim,
      fullName: student.fullName,
    },
    rememberMe
  );

  await prisma.$transaction([
    prisma.user.update({ where: { id: student.userId }, data: { lastLoginAt: new Date() } }),
    prisma.activityLog.create({
      data: {
        userId: student.userId,
        action: "LOGIN",
        description: `Mahasiswa "${student.fullName}" (${student.nim}) masuk ke sistem`,
        ipAddress: ip,
      },
    }),
  ]);

  return NextResponse.json({ success: true, redirect: "/mahasiswa/dashboard" });
}
