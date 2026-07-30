"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { hashPassword } from "@/lib/auth";
import {
  createStudentSchema,
  updateStudentSchema,
  type CreateStudentInput,
  type UpdateStudentInput,
} from "@/lib/validations/student";

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

export async function createStudent(input: CreateStudentInput): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = createStudentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const { password, ...studentData } = parsed.data;

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({ data: { role: "MAHASISWA", passwordHash } });
    await prisma.student.create({ data: { ...studentData, userId: user.id } });
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "CREATE_STUDENT",
        description: `Menambahkan mahasiswa "${studentData.fullName}" (${studentData.nim})`,
      },
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { success: false, error: "NIM sudah terdaftar. Gunakan NIM lain." };
    }
    console.error("createStudent failed:", err);
    return { success: false, error: "Gagal menyimpan data. Coba lagi." };
  }

  revalidatePath("/admin/mahasiswa");
  return { success: true };
}

export async function updateStudent(input: UpdateStudentInput): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = updateStudentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const { id, ...studentData } = parsed.data;

  try {
    await prisma.student.update({ where: { id }, data: studentData });
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "UPDATE_STUDENT",
        description: `Memperbarui data mahasiswa "${studentData.fullName}" (${studentData.nim})`,
      },
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { success: false, error: "NIM sudah dipakai mahasiswa lain." };
    }
    console.error("updateStudent failed:", err);
    return { success: false, error: "Gagal memperbarui data. Coba lagi." };
  }

  revalidatePath("/admin/mahasiswa");
  return { success: true };
}

export async function deleteStudent(id: string): Promise<ActionResult> {
  const session = await requireAdmin();

  try {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return { success: false, error: "Mahasiswa tidak ditemukan." };
    }

    // Menghapus User otomatis cascade ke Student, KRS, dan Grade terkait
    // (lihat onDelete: Cascade di prisma/schema.prisma).
    await prisma.user.delete({ where: { id: student.userId } });

    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "DELETE_STUDENT",
        description: `Menghapus mahasiswa "${student.fullName}" (${student.nim})`,
      },
    });
  } catch (err) {
    console.error("deleteStudent failed:", err);
    return { success: false, error: "Gagal menghapus data. Coba lagi." };
  }

  revalidatePath("/admin/mahasiswa");
  return { success: true };
}
