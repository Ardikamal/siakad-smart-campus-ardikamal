import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, clearSessionCookie } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  await clearSessionCookie();

  if (session) {
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "LOGOUT",
        description: `${session.fullName} keluar dari sistem`,
      },
    });
  }

  return NextResponse.json({ success: true });
}
