import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getActiveAcademicYear } from "@/lib/queries/krs";
import { getStudentWeeklySchedule } from "@/lib/queries/jadwal-mahasiswa";
import { HARI_LABEL, HARI_OPTIONS } from "@/lib/academic-options";
import { Card, CardContent } from "@/components/ui/card";

export default async function JadwalMahasiswaPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) redirect("/login");

  const activeYear = await getActiveAcademicYear();
  const schedule = activeYear ? await getStudentWeeklySchedule(student.id, activeYear.id) : [];

  const byDay = HARI_OPTIONS.map((day) => ({
    day,
    items: schedule.filter((s) => s.hari === day).sort((a, b) => a.jamMulai.localeCompare(b.jamMulai)),
  })).filter((d) => d.items.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">Jadwal Kuliah</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeYear
            ? `Jadwal mingguan — ${activeYear.tahun} ${activeYear.semester === "GANJIL" ? "Ganjil" : "Genap"}`
            : "Belum ada semester aktif."}
        </p>
      </div>

      {byDay.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Belum ada jadwal — pastikan KRS kamu sudah disetujui admin.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {byDay.map((d) => (
            <Card key={d.day}>
              <CardContent className="p-5">
                <h2 className="mb-3 font-serif text-lg font-semibold text-foreground">{HARI_LABEL[d.day]}</h2>
                <div className="divide-y divide-border">
                  {d.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{item.courseName}</p>
                        <p className="text-xs text-muted-foreground">{item.ruangan}</p>
                      </div>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {item.jamMulai}–{item.jamSelesai}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
