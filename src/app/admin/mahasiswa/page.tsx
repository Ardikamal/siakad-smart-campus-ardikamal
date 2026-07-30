import { getStudentList, type StudentListParams } from "@/lib/queries/students";
import { MahasiswaPageClient } from "@/components/admin/mahasiswa/mahasiswa-page-client";

interface MahasiswaPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstString(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function MahasiswaPage({ searchParams }: MahasiswaPageProps) {
  const params = await searchParams;

  const listParams: StudentListParams = {
    search: firstString(params.search),
    status: firstString(params.status) as StudentListParams["status"],
    sortBy: firstString(params.sortBy) as StudentListParams["sortBy"],
    sortOrder: firstString(params.sortOrder) as StudentListParams["sortOrder"],
    page: params.page ? Number(firstString(params.page)) : 1,
  };

  const result = await getStudentList(listParams);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">Data Mahasiswa</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola data akun dan profil akademik seluruh mahasiswa.
        </p>
      </div>

      <MahasiswaPageClient
        students={result.items}
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        pageSize={result.pageSize}
      />
    </div>
  );
}
