import { prisma } from "@/lib/prisma";
import { CampusProfileForm } from "@/components/admin/pengaturan/campus-profile-form";
import { AcademicYearSection } from "@/components/admin/pengaturan/academic-year-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PengaturanPage() {
  const [campusProfile, academicYears] = await Promise.all([
    prisma.campusProfile.findFirst(),
    prisma.academicYear.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">Pengaturan</h1>
        <p className="mt-1 text-sm text-muted-foreground">Profil kampus, tahun akademik, dan semester aktif.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil Kampus</CardTitle>
          <CardDescription>Ditampilkan di kop dokumen cetak (KRS, KHS, Transkrip) dan halaman login.</CardDescription>
        </CardHeader>
        <CardContent>
          {campusProfile ? (
            <CampusProfileForm profile={campusProfile} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Profil kampus belum diatur. Jalankan seeder untuk membuat baris awal.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tahun Akademik &amp; Semester Aktif</CardTitle>
          <CardDescription>Kelola periode akademik yang tersedia di sistem.</CardDescription>
        </CardHeader>
        <CardContent>
          <AcademicYearSection academicYears={academicYears} />
        </CardContent>
      </Card>
    </div>
  );
}
