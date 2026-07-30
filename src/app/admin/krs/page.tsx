import { getKrsListForAdmin, type KrsAdminListParams } from "@/lib/queries/krs-admin";
import { KrsAdminPageClient } from "@/components/admin/krs/krs-page-client";

interface KrsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstString(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function AdminKrsPage({ searchParams }: KrsPageProps) {
  const params = await searchParams;

  const listParams: KrsAdminListParams = {
    search: firstString(params.search),
    status: firstString(params.status) as KrsAdminListParams["status"],
    page: params.page ? Number(firstString(params.page)) : 1,
  };

  const result = await getKrsListForAdmin(listParams);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">Kelola KRS</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {result.activeYear
            ? `Tinjau dan setujui pengajuan KRS — ${result.activeYear.tahun} ${result.activeYear.semester === "GANJIL" ? "Ganjil" : "Genap"}`
            : "Belum ada semester aktif."}
        </p>
      </div>

      <KrsAdminPageClient
        rows={result.items}
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        pageSize={result.pageSize}
      />
    </div>
  );
}
