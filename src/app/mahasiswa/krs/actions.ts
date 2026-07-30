"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getMaxSksByIps } from "@/lib/academic";
import { getLastCompletedIps } from "@/lib/queries/krs";

export interface ActionResult {
  success: boolean;
  error?: string;
}

async function requireMahasiswa() {
  const session = await getSession();
  if (!session || session.role !== "MAHASISWA") {
    redirect("/login");
  }
  return session;
}

function isUniqueConstraintError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2002";
}

export async function addKrs(courseId: string): Promise<ActionResult> {
  const session = await requireMahasiswa();

  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) return { success: false, error: "Data mahasiswa tidak ditemukan." };

  const activeYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
  if (!activeYear) return { success: false, error: "Belum ada semester aktif untuk pengisian KRS." };

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return { success: false, error: "Mata kuliah tidak ditemukan." };

  const currentKrs = await prisma.krs.findMany({
    where: { studentId: student.id, academicYearId: activeYear.id },
    include: { course: true },
  });
  const currentSks = currentKrs.reduce((sum, k) => sum + k.course.sks, 0);

  const lastIps = await getLastCompletedIps(student.id, activeYear.id);
  const maxSks = getMaxSksByIps(lastIps);

  if (currentSks + course.sks > maxSks) {
    return {
      success: false,
      error: `Melebihi batas maksimal ${maxSks} SKS semester ini (berdasarkan IPS terakhir). SKS yang sudah diambil: ${currentSks}, mata kuliah ini: ${course.sks} SKS.`,
    };
  }

  try {
    await prisma.krs.create({
      data: { studentId: student.id, courseId, academicYearId: activeYear.id, status: "DIAJUKAN" },
    });
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "CREATE_KRS",
        description: `${student.fullName} (${student.nim}) mengajukan KRS untuk "${course.nama}"`,
      },
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { success: false, error: "Mata kuliah ini sudah kamu ambil semester ini." };
    }
    console.error("addKrs failed:", err);
    return { success: false, error: "Gagal menyimpan. Coba lagi." };
  }

  revalidatePath("/mahasiswa/krs");
  return { success: true };
}

export async function cancelKrs(krsId: string): Promise<ActionResult> {
  const session = await requireMahasiswa();

  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) return { success: false, error: "Data mahasiswa tidak ditemukan." };

  const krs = await prisma.krs.findUnique({ where: { id: krsId }, include: { course: true } });
  if (!krs || krs.studentId !== student.id) {
    return { success: false, error: "KRS tidak ditemukan." };
  }
  if (krs.status !== "DIAJUKAN") {
    return { success: false, error: "KRS yang sudah diproses admin tidak bisa dibatalkan sendiri. Hubungi admin akademik." };
  }

  try {
    await prisma.krs.delete({ where: { id: krsId } });
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "CANCEL_KRS",
        description: `${student.fullName} (${student.nim}) membatalkan pengajuan KRS "${krs.course.nama}"`,
      },
    });
  } catch (err) {
    console.error("cancelKrs failed:", err);
    return { success: false, error: "Gagal membatalkan. Coba lagi." };
  }

  revalidatePath("/mahasiswa/krs");
  return { success: true };
}
