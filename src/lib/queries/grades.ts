import "server-only";
import { prisma } from "@/lib/prisma";

export async function getStudentAllGrades(studentId: string) {
  return prisma.grade.findMany({
    where: { studentId },
    include: { course: true, academicYear: true },
    orderBy: [{ academicYear: { createdAt: "asc" } }, { course: { nama: "asc" } }],
  });
}

export async function getStudentGradesForYear(studentId: string, academicYearId: string) {
  return prisma.grade.findMany({
    where: { studentId, academicYearId },
    include: { course: true },
    orderBy: { course: { nama: "asc" } },
  });
}

/** Tahun akademik yang punya nilai untuk mahasiswa ini — dipakai dropdown pemilih KHS. */
export async function getAcademicYearsWithGradesForStudent(studentId: string) {
  return prisma.academicYear.findMany({
    where: { grades: { some: { studentId } } },
    orderBy: { createdAt: "desc" },
  });
}
