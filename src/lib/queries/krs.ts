import "server-only";
import { prisma } from "@/lib/prisma";
import { calculateGpa } from "@/lib/academic";

export async function getActiveAcademicYear() {
  return prisma.academicYear.findFirst({ where: { isActive: true } });
}

/**
 * IPS dari semester terakhir yang SUDAH ada nilainya sebelum tahun akademik
 * aktif — dipakai untuk menentukan batas maksimal SKS semester ini.
 * Mengembalikan `null` jika belum ada riwayat nilai sama sekali (mahasiswa baru).
 */
export async function getLastCompletedIps(studentId: string, activeAcademicYearId: string) {
  const lastYearWithGrades = await prisma.academicYear.findFirst({
    where: { id: { not: activeAcademicYearId }, grades: { some: { studentId } } },
    orderBy: { createdAt: "desc" },
    include: { grades: { where: { studentId }, include: { course: true } } },
  });
  if (!lastYearWithGrades) return null;
  return calculateGpa(lastYearWithGrades.grades ?? []).gpa;
}

export async function getStudentKrsForYear(studentId: string, academicYearId: string) {
  return prisma.krs.findMany({
    where: { studentId, academicYearId },
    include: { course: { include: { schedules: true } } },
    orderBy: { createdAt: "asc" },
  });
}

/** Mata kuliah yang punya jadwal dan belum diambil mahasiswa di tahun akademik ini. */
export async function getAvailableCoursesForKrs(studentId: string, academicYearId: string) {
  const taken = await prisma.krs.findMany({
    where: { studentId, academicYearId },
    select: { courseId: true },
  });
  const takenIds = taken.map((k) => k.courseId);

  return prisma.course.findMany({
    where: takenIds.length > 0 ? { id: { notIn: takenIds } } : {},
    include: { schedules: true },
    orderBy: [{ semester: "asc" }, { nama: "asc" }],
  });
}
