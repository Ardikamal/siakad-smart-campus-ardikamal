import { Users, UserCheck, BookOpen, LayoutGrid } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { getAdminDashboardData } from "@/lib/queries/dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { MahasiswaChart } from "@/components/dashboard/mahasiswa-chart";
import { AkademikChart } from "@/components/dashboard/akademik-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ringkasan kondisi akademik SIAKAD Smart Campus hari ini.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Mahasiswa" value={data.totalMahasiswa} icon={Users} accent="accent" />
        <StatCard label="Mahasiswa Aktif" value={data.mahasiswaAktif} icon={UserCheck} accent="success" />
        <StatCard label="Jumlah Mata Kuliah" value={data.totalMataKuliah} icon={BookOpen} accent="secondary" />
        <StatCard label="Jumlah Kelas" value={data.totalKelas} icon={LayoutGrid} accent="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Grafik Mahasiswa</CardTitle>
            <CardDescription>Distribusi mahasiswa aktif per program studi</CardDescription>
          </CardHeader>
          <CardContent>
            <MahasiswaChart data={data.mahasiswaPerProdi} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Grafik Akademik</CardTitle>
            <CardDescription>Rata-rata IPK seluruh mahasiswa per semester</CardDescription>
          </CardHeader>
          <CardContent>
            {data.gradeTrend.length === 0 ? (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                Belum ada data nilai untuk ditampilkan.
              </div>
            ) : (
              <AkademikChart data={data.gradeTrend} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Sistem</CardTitle>
          <CardDescription>Log aktivitas terbaru di seluruh sistem</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentLogs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Belum ada aktivitas tercatat.</p>
          ) : (
            <div className="divide-y divide-border">
              {data.recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{log.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(log.createdAt, { addSuffix: true, locale: localeId })}
                    </p>
                  </div>
                  <Badge
                    variant={log.action === "LOGIN_FAILED" ? "danger" : "muted"}
                    className="shrink-0 font-mono text-[10px]"
                  >
                    {log.action}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
