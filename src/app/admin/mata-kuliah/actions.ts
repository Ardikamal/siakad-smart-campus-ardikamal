"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  createCourseSchema,
  updateCourseSchema,
  type CreateCourseInput,
  type UpdateCourseInput,
} from "@/lib/validations/course";

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

function isUniqueConstraintError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2002";
}

export async function createCourse(input: CreateCourseInput): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = createCourseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    await prisma.course.create({ data: parsed.data });
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "CREATE_COURSE",
        description: `Menambahkan mata kuliah "${parsed.data.nama}" (${parsed.data.kode})`,
      },
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { success: false, error: "Kode mata kuliah sudah dipakai. Gunakan kode lain." };
    }
    console.error("createCourse failed:", err);
    return { success: false, error: "Gagal menyimpan data. Coba lagi." };
  }

  revalidatePath("/admin/mata-kuliah");
  return { success: true };
}

export async function updateCourse(input: UpdateCourseInput): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = updateCourseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const { id, ...courseData } = parsed.data;

  try {
    await prisma.course.update({ where: { id }, data: courseData });
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "UPDATE_COURSE",
        description: `Memperbarui mata kuliah "${courseData.nama}" (${courseData.kode})`,
      },
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { success: false, error: "Kode mata kuliah sudah dipakai mata kuliah lain." };
    }
    console.error("updateCourse failed:", err);
    return { success: false, error: "Gagal memperbarui data. Coba lagi." };
  }

  revalidatePath("/admin/mata-kuliah");
  return { success: true };
}

export async function deleteCourse(id: string): Promise<ActionResult> {
  const session = await requireAdmin();

  try {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return { success: false, error: "Mata kuliah tidak ditemukan." };
    }

    // onDelete: Cascade di schema.prisma membersihkan schedules, krs, dan
    // grades yang terkait — dialog konfirmasi di UI menampilkan jumlahnya
    // dulu sebelum admin menekan tombol hapus.
    await prisma.course.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "DELETE_COURSE",
        description: `Menghapus mata kuliah "${course.nama}" (${course.kode})`,
      },
    });
  } catch (err) {
    console.error("deleteCourse failed:", err);
    return { success: false, error: "Gagal menghapus data. Coba lagi." };
  }

  revalidatePath("/admin/mata-kuliah");
  return { success: true };
}
