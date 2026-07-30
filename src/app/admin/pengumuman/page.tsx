import { getAnnouncementList } from "@/lib/queries/announcements";
import { PengumumanPageClient } from "@/components/admin/pengumuman/pengumuman-page-client";

interface PengumumanPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PengumumanPage({ searchParams }: PengumumanPageProps) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const page = params.page && typeof params.page === "string" ? Number(params.page) : 1;

  const result = await getAnnouncementList({ search, page });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">Pengumuman</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tambah, edit, dan hapus pengumuman akademik.</p>
      </div>

      <PengumumanPageClient
        announcements={result.items}
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        pageSize={result.pageSize}
      />
    </div>
  );
}
