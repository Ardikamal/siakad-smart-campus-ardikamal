import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getStudentAllGrades } from "@/lib/queries/grades";
import { calculateGpa } from "@/lib/academic";
import { GradeTable } from "@/components/mahasiswa/shared/grade-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function NilaiPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) redirect("/login");

  const allGrades = await getStudentAllGrades(student.id);
  const { gpa: ipk, totalSks } = calculateGpa(allGrades);

  const grouped = new Map<string, { label: string; grades: typeof allGrades }>();
  for (const g of allGrades) {
    const key = g.academicYear.id;
    const label = `${g.academicYear.tahun} ${g.academicYear.semester === "GANJIL" ? "Ganjil" : "Genap"}`;
    if (!grouped.has(key)) grouped.set(key, { label, grades: [] });
    grouped.get(key)?.grades.push(g);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">Nilai &amp; Transkrip</h1>
          <p className="mt-1 text-sm text-muted-foreground">Riwayat nilai seluruh semester.</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/api/mahasiswa/transkrip/cetak">
            <Download className="h-4 w-4" /> Cetak Transkrip
          </a>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">IPK</p>
            <p className="font-serif text-2xl font-semibold text-foreground">{ipk.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total SKS Lulus</p>
            <p className="font-serif text-2xl font-semibold text-foreground">{totalSks}</p>
          </CardContent>
        </Card>
      </div>

      {grouped.size === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Belum ada nilai yang tercatat.
          </CardContent>
        </Card>
      ) : (
        Array.from(grouped.values()).map((group) => {
          const semesterStats = calculateGpa(group.grades);
          return (
            <Card key={group.label}>
              <CardHeader>
                <CardTitle>{group.label}</CardTitle>
                <CardDescription>
                  {semesterStats.totalSks} SKS · IPS {semesterStats.gpa.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GradeTable grades={group.grades} />
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
