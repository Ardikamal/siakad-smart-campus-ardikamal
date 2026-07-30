import { Card, CardContent } from "@/components/ui/card";
import { KrsToolbar } from "@/components/admin/krs/krs-toolbar";
import { KrsTable } from "@/components/admin/krs/krs-table";
import { PaginationBar } from "@/components/shared/pagination-bar";
import type { KrsAdminRow } from "@/lib/types/krs";

interface KrsPageClientProps {
  rows: KrsAdminRow[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export function KrsAdminPageClient({ rows, page, totalPages, total, pageSize }: KrsPageClientProps) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <KrsToolbar />
        <KrsTable rows={rows} />
        <PaginationBar page={page} totalPages={totalPages} total={total} pageSize={pageSize} />
      </CardContent>
    </Card>
  );
}
