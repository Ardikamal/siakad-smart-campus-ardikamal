import "server-only";
import { prisma } from "@/lib/prisma";

export async function getStudentWeeklySchedule(studentId: string, academicYearId: string) {
  const krsList = await prisma.krs.findMany({
    where: { studentId, academicYearId, status: "DISETUJUI" },
    include: { course: { include: { schedules: true } } },
  });

  return krsList.flatMap((k) =>
    k.course.schedules.map((s) => ({
      id: s.id,
      hari: s.hari,
      jamMulai: s.jamMulai,
      jamSelesai: s.jamSelesai,
      ruangan: s.ruangan,
      courseName: k.course.nama,
      courseCode: k.course.kode,
    }))
  );
}
