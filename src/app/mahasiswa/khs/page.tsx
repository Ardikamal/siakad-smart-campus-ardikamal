import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getAcademicYearsWithGradesForStudent, getStudentGradesForYear } from "@/lib/queries/grades";
import { calculateGpa } from "@/lib/academic";
import { KhsYearSelector } from "@/components/mahasiswa/khs/khs-year-selector";
import { GradeTable } from "@/components/mahasiswa/shared/grade-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface KhsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function KhsPage({ searchParams }: KhsPageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) redirect("/login");

  const params = await searchParams;
  const academicYears = await getAcademicYearsWithGradesForStudent(student.id);

  const requestedYearId = typeof params.academicYearId === "string" ? params.academicYearId : undefined;
  const selectedYearId = requestedYearId ?? academicYears[0]?.id;

  const grades = selectedYearId ? await getStudentGradesForYear(student.id, selectedYearId) : [];
  const { gpa: ips, totalSks } = calculateGpa(grades);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">KHS</h1>
        <p className="mt-1 text-sm text-muted-foreground">Kartu Hasil Studi per semester.</p>
      </div>

      {academicYears.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Belum ada nilai yang tercatat untuk semester manapun.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <KhsYearSelector academicYears={academicYears} selectedYearId={selectedYearId} />
            {selectedYearId && (
              <Button variant="outline" size="sm" asChild>
                <a href={`/api/mahasiswa/khs/cetak?academicYearId=${selectedYearId}`}>
                  <Download className="h-4 w-4" /> Cetak KHS
                </a>
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">IPS Semester Ini</p>
                <p className="font-serif text-2xl font-semibold text-foreground">{ips.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">SKS Semester Ini</p>
                <p className="font-serif text-2xl font-semibold text-foreground">{totalSks}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rincian Nilai</CardTitle>
              <CardDescription>Daftar mata kuliah dan nilai semester ini</CardDescription>
            </CardHeader>
            <CardContent>
              <GradeTable grades={grades} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
