"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export interface ActionResult {
  success: boolean;
  error?: string;
}

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }
  return session;
}

export async function approveKrs(krsId: string): Promise<ActionResult> {
  const session = await requireAdmin();

  try {
    const krs = await prisma.krs.update({
      where: { id: krsId },
      data: { status: "DISETUJUI" },
      include: { student: true, course: true },
    });
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "APPROVE_KRS",
        description: `Menyetujui KRS ${krs.student.fullName} (${krs.student.nim}) — "${krs.course.nama}"`,
      },
    });
  } catch (err) {
    console.error("approveKrs failed:", err);
    return { success: false, error: "Gagal menyetujui KRS." };
  }

  revalidatePath("/admin/krs");
  return { success: true };
}

export async function rejectKrs(krsId: string): Promise<ActionResult> {
  const session = await requireAdmin();

  try {
    const krs = await prisma.krs.update({
      where: { id: krsId },
      data: { status: "DITOLAK" },
      include: { student: true, course: true },
    });
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "REJECT_KRS",
        description: `Menolak KRS ${krs.student.fullName} (${krs.student.nim}) — "${krs.course.nama}"`,
      },
    });
  } catch (err) {
    console.error("rejectKrs failed:", err);
    return { success: false, error: "Gagal menolak KRS." };
  }

  revalidatePath("/admin/krs");
  return { success: true };
}
