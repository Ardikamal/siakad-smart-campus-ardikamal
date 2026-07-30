"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export function PaginationBar({ page, totalPages, total, pageSize }: PaginationBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Menampilkan {start}-{end} dari {total} mahasiswa
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
          <ChevronLeft className="h-4 w-4" /> Sebelumnya
        </Button>
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          Halaman {page} dari {totalPages}
        </span>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
          Berikutnya <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
