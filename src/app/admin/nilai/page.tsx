import { prisma } from "@/lib/prisma";
import { getStudentsForGrading } from "@/lib/queries/nilai-admin";
import { NilaiFilterBar } from "@/components/admin/nilai/nilai-filter-bar";
import { NilaiTable } from "@/components/admin/nilai/nilai-table";
import { Card, CardContent } from "@/components/ui/card";

interface NilaiPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstString(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function NilaiPage({ searchParams }: NilaiPageProps) {
  const params = await searchParams;

  const [academicYears, courses] = await Promise.all([
    prisma.academicYear.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.course.findMany({ orderBy: [{ semester: "asc" }, { nama: "asc" }] }),
  ]);

  const activeYear = academicYears.find((ay) => ay.isActive);
  const selectedYearId = firstString(params.academicYearId) ?? activeYear?.id ?? academicYears[0]?.id;
  const selectedCourseId = firstString(params.courseId) ?? courses[0]?.id;

  const students =
    selectedYearId && selectedCourseId ? await getStudentsForGrading(selectedCourseId, selectedYearId) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">Kelola Nilai</h1>
        <p className="mt-1 text-sm text-muted-foreground">Input dan kelola nilai akhir mahasiswa per mata kuliah.</p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <NilaiFilterBar
            academicYears={academicYears}
            courses={courses}
            selectedYearId={selectedYearId}
            selectedCourseId={selectedCourseId}
          />
          {selectedYearId && selectedCourseId ? (
            <NilaiTable students={students} courseId={selectedCourseId} academicYearId={selectedYearId} />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Pilih tahun akademik dan mata kuliah untuk mulai menginput nilai.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
