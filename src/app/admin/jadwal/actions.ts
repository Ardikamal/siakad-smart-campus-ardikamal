"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { findConflictingSchedule } from "@/lib/queries/schedules";
import { HARI_LABEL } from "@/lib/academic-options";
import {
  createScheduleSchema,
  updateScheduleSchema,
  type CreateScheduleInput,
  type UpdateScheduleInput,
} from "@/lib/validations/schedule";

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

export async function createSchedule(input: CreateScheduleInput): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = createScheduleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const data = parsed.data;

  const conflict = await findConflictingSchedule({
    hari: data.hari,
    ruangan: data.ruangan,
    jamMulai: data.jamMulai,
    jamSelesai: data.jamSelesai,
  });
  if (conflict) {
    return {
      success: false,
      error: `Ruangan ${data.ruangan} sudah dipakai "${conflict.course.nama}" pada hari ${HARI_LABEL[data.hari]} jam ${conflict.jamMulai}-${conflict.jamSelesai}.`,
    };
  }

  try {
    const course = await prisma.course.findUnique({ where: { id: data.courseId } });
    await prisma.schedule.create({ data });
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "CREATE_SCHEDULE",
        description: `Menambahkan jadwal "${course?.nama ?? data.courseId}" — ${HARI_LABEL[data.hari]} ${data.jamMulai}-${data.jamSelesai}`,
      },
    });
  } catch (err) {
    console.error("createSchedule failed:", err);
    return { success: false, error: "Gagal menyimpan data. Coba lagi." };
  }

  revalidatePath("/admin/jadwal");
  return { success: true };
}

export async function updateSchedule(input: UpdateScheduleInput): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = updateScheduleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const { id, ...data } = parsed.data;

  const conflict = await findConflictingSchedule({
    hari: data.hari,
    ruangan: data.ruangan,
    jamMulai: data.jamMulai,
    jamSelesai: data.jamSelesai,
    excludeId: id,
  });
  if (conflict) {
    return {
      success: false,
      error: `Ruangan ${data.ruangan} sudah dipakai "${conflict.course.nama}" pada hari ${HARI_LABEL[data.hari]} jam ${conflict.jamMulai}-${conflict.jamSelesai}.`,
    };
  }

  try {
    await prisma.schedule.update({ where: { id }, data });
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "UPDATE_SCHEDULE",
        description: `Memperbarui jadwal — ${HARI_LABEL[data.hari]} ${data.jamMulai}-${data.jamSelesai} di ${data.ruangan}`,
      },
    });
  } catch (err) {
    console.error("updateSchedule failed:", err);
    return { success: false, error: "Gagal memperbarui data. Coba lagi." };
  }

  revalidatePath("/admin/jadwal");
  return { success: true };
}

export async function deleteSchedule(id: string): Promise<ActionResult> {
  const session = await requireAdmin();

  try {
    const schedule = await prisma.schedule.findUnique({ where: { id }, include: { course: true } });
    if (!schedule) {
      return { success: false, error: "Jadwal tidak ditemukan." };
    }

    await prisma.schedule.delete({ where: { id } });
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "DELETE_SCHEDULE",
        description: `Menghapus jadwal "${schedule.course.nama}" — ${HARI_LABEL[schedule.hari]} ${schedule.jamMulai}-${schedule.jamSelesai}`,
      },
    });
  } catch (err) {
    console.error("deleteSchedule failed:", err);
    return { success: false, error: "Gagal menghapus data. Coba lagi." };
  }

  revalidatePath("/admin/jadwal");
  return { success: true };
}
