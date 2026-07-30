import { redirect } from "next/navigation";
import { CalendarClock, Megaphone } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getMahasiswaDashboardData } from "@/lib/queries/dashboard";
import { SksProgressRing } from "@/components/dashboard/sks-progress-ring";
import { SKS_TARGET_LULUS } from "@/lib/academic";
import { STATUS_AKADEMIK_LABEL } from "@/lib/academic-options";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function MahasiswaDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) redirect("/login");

  const data = await getMahasiswaDashboardData(student.id);
  const firstName = data.student.fullName.split(" ")[0];
  const semesterLabel = data.activeYear
    ? `${data.activeYear.tahun} ${data.activeYear.semester === "GANJIL" ? "Ganjil" : "Genap"}`
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">Halo, {firstName} 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {semesterLabel ? `Semester berjalan: ${semesterLabel}` : "Belum ada semester aktif saat ini."}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="flex items-center justify-center lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-3 p-6">
            <SksProgressRing current={data.totalSks} target={SKS_TARGET_LULUS} />
            <p className="text-sm font-medium text-foreground">SKS Tempuh</p>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">IPK</p>
              <p className="font-serif text-3xl font-semibold text-foreground">{data.ipk.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">IPS</p>
              <p className="font-serif text-3xl font-semibold text-foreground">{data.ips.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Status Akademik</p>
              <Badge
                variant={data.student.statusAkademik === "AKTIF" ? "success" : "warning"}
                className="mt-2"
              >
                {STATUS_AKADEMIK_LABEL[data.student.statusAkademik]}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-accent" /> Jadwal Hari Ini
            </CardTitle>
            <CardDescription>Mata kuliah yang kamu ambil untuk hari ini</CardDescription>
          </CardHeader>
          <CardContent>
            {data.jadwalHariIni.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Tidak ada jadwal kuliah hari ini.</p>
            ) : (
              <div className="divide-y divide-border">
                {data.jadwalHariIni.map((j) => (
                  <div key={j.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{j.courseName}</p>
                      <p className="text-xs text-muted-foreground">{j.ruangan}</p>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {j.jamMulai}–{j.jamSelesai}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-accent" /> Pengumuman Akademik
            </CardTitle>
            <CardDescription>Info terbaru dari kampus</CardDescription>
          </CardHeader>
          <CardContent>
            {data.announcements.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Belum ada pengumuman.</p>
            ) : (
              <div className="divide-y divide-border">
                {data.announcements.map((a) => (
                  <div key={a.id} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-sm font-medium text-foreground">{a.judul}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{a.konten}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
