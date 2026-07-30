import "server-only";
import { prisma } from "@/lib/prisma";

export interface StudentForGrading {
  studentId: string;
  fullName: string;
  nim: string;
  existingGrade: { id: string; nilaiAngka: number; nilaiHuruf: string; bobot: number } | null;
}

/**
 * Mahasiswa yang layak dinilai untuk kombinasi mata kuliah + tahun akademik
 * ini — yaitu mahasiswa dengan KRS berstatus DISETUJUI. Nilai yang sudah
 * pernah diinput (jika ada) ikut disertakan supaya form bisa menampilkan
 * nilai lama sebelum diedit.
 */
export async function getStudentsForGrading(
  courseId: string,
  academicYearId: string
): Promise<StudentForGrading[]> {
  const krsList = await prisma.krs.findMany({
    where: { courseId, academicYearId, status: "DISETUJUI" },
    include: { student: true },
    orderBy: { student: { fullName: "asc" } },
  });

  if (krsList.length === 0) return [];

  const studentIds = krsList.map((k) => k.studentId);
  const existingGrades = await prisma.grade.findMany({
    where: { courseId, academicYearId, studentId: { in: studentIds } },
  });
  const gradeByStudent = new Map(existingGrades.map((g) => [g.studentId, g]));

  return krsList.map((k) => ({
    studentId: k.studentId,
    fullName: k.student.fullName,
    nim: k.student.nim,
    existingGrade: gradeByStudent.get(k.studentId) ?? null,
  }));
}
