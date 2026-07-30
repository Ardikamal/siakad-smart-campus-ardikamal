import "server-only";
import { prisma } from "@/lib/prisma";
import { calculateGpa } from "@/lib/academic";

export async function getAdminDashboardData() {
  const [totalMahasiswa, mahasiswaAktif, totalMataKuliah, totalKelas, recentLogs, mahasiswaPerProdiRaw, academicYears] =
    await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { statusAkademik: "AKTIF" } }),
      prisma.course.count(),
      prisma.schedule.count(),
      prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
      prisma.student.groupBy({ by: ["prodi"], _count: { _all: true } }),
      prisma.academicYear.findMany({
        orderBy: { createdAt: "asc" },
        include: { grades: { include: { course: true } } },
      }),
    ]);

  const mahasiswaPerProdi = mahasiswaPerProdiRaw.map((p) => ({
    prodi: p.prodi.replace("S1 ", ""),
    jumlah: p._count._all,
  }));

  const gradeTrend = academicYears
    .filter((ay) => (ay.grades?.length ?? 0) > 0)
    .map((ay) => ({
      label: `${ay.tahun.split("/")[1]} ${ay.semester === "GANJIL" ? "Ganjil" : "Genap"}`,
      ipk: calculateGpa(ay.grades ?? []).gpa,
    }));

  return {
    totalMahasiswa,
    mahasiswaAktif,
    totalMataKuliah,
    totalKelas,
    recentLogs,
    mahasiswaPerProdi,
    gradeTrend,
  };
}

const HARI_BY_JS_DAY = ["MINGGU", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"] as const;

export async function getMahasiswaDashboardData(studentId: string) {
  const student = await prisma.student.findUniqueOrThrow({ where: { id: studentId } });

  const [allGrades, activeYear, announcements] = await Promise.all([
    prisma.grade.findMany({ where: { studentId }, include: { course: true } }),
    prisma.academicYear.findFirst({ where: { isActive: true } }),
    prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const { gpa: ipk, totalSks } = calculateGpa(allGrades);
  const semesterGrades = activeYear ? allGrades.filter((g) => g.academicYearId === activeYear.id) : [];
  const { gpa: ips } = calculateGpa(semesterGrades);

  const krsAktif = activeYear
    ? await prisma.krs.findMany({
        where: { studentId, academicYearId: activeYear.id },
        include: { course: { include: { schedules: true } } },
        orderBy: { createdAt: "asc" },
      })
    : [];

  const todayName = HARI_BY_JS_DAY[new Date().getDay()];
  const jadwalHariIni = krsAktif
    .flatMap((k) => k.course.schedules.map((s) => ({ ...s, courseName: k.course.nama })))
    .filter((s) => s.hari === todayName)
    .sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));

  return { student, ipk, ips, totalSks, activeYear, krsAktif, jadwalHariIni, announcements };
}
