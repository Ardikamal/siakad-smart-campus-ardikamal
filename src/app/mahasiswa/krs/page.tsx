import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getActiveAcademicYear, getAvailableCoursesForKrs, getLastCompletedIps, getStudentKrsForYear } from "@/lib/queries/krs";
import { getMaxSksByIps } from "@/lib/academic";
import { KrsPageClient } from "@/components/mahasiswa/krs/krs-page-client";

export default async function KrsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) redirect("/login");

  const activeYear = await getActiveAcademicYear();

  if (!activeYear) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">KRS</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kartu Rencana Studi</p>
        </div>
        <p className="text-sm text-muted-foreground">Belum ada semester aktif untuk pengisian KRS saat ini.</p>
      </div>
    );
  }

  const [currentKrs, availableCourses, lastIps] = await Promise.all([
    getStudentKrsForYear(student.id, activeYear.id),
    getAvailableCoursesForKrs(student.id, activeYear.id),
    getLastCompletedIps(student.id, activeYear.id),
  ]);

  const maxSks = getMaxSksByIps(lastIps);
  const currentSks = currentKrs.reduce((sum, k) => sum + k.course.sks, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">KRS</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kartu Rencana Studi — {activeYear.tahun} {activeYear.semester === "GANJIL" ? "Ganjil" : "Genap"}
        </p>
      </div>

      <KrsPageClient
        currentKrs={currentKrs}
        availableCourses={availableCourses}
        currentSks={currentSks}
        maxSks={maxSks}
        lastIps={lastIps}
      />
    </div>
  );
}
