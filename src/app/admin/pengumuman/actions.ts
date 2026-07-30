"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  type CreateAnnouncementInput,
  type UpdateAnnouncementInput,
} from "@/lib/validations/announcement";

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

export async function createAnnouncement(input: CreateAnnouncementInput): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = createAnnouncementSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    await prisma.announcement.create({ data: parsed.data });
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "CREATE_ANNOUNCEMENT",
        description: `Menambahkan pengumuman: ${parsed.data.judul}`,
      },
    });
  } catch (err) {
    console.error("createAnnouncement failed:", err);
    return { success: false, error: "Gagal menyimpan pengumuman. Coba lagi." };
  }

  revalidatePath("/admin/pengumuman");
  return { success: true };
}

export async function updateAnnouncement(input: UpdateAnnouncementInput): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = updateAnnouncementSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const { id, ...data } = parsed.data;

  try {
    await prisma.announcement.update({ where: { id }, data });
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "UPDATE_ANNOUNCEMENT",
        description: `Memperbarui pengumuman: ${data.judul}`,
      },
    });
  } catch (err) {
    console.error("updateAnnouncement failed:", err);
    return { success: false, error: "Gagal memperbarui pengumuman. Coba lagi." };
  }

  revalidatePath("/admin/pengumuman");
  return { success: true };
}

export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  const session = await requireAdmin();

  try {
    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) return { success: false, error: "Pengumuman tidak ditemukan." };

    await prisma.announcement.delete({ where: { id } });
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "DELETE_ANNOUNCEMENT",
        description: `Menghapus pengumuman: ${announcement.judul}`,
      },
    });
  } catch (err) {
    console.error("deleteAnnouncement failed:", err);
    return { success: false, error: "Gagal menghapus pengumuman. Coba lagi." };
  }

  revalidatePath("/admin/pengumuman");
  return { success: true };
}
