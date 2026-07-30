"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Download, FileSpreadsheet, FileText, Plus, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { STATUS_AKADEMIK_LABEL, STATUS_AKADEMIK_OPTIONS } from "@/lib/academic-options";
import { cn } from "@/lib/utils";

interface MahasiswaToolbarProps {
  onAddClick: () => void;
  onImportClick: () => void;
}

export function MahasiswaToolbar({ onAddClick, onImportClick }: MahasiswaToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "SEMUA") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("search", search || null);
  }

  function exportUrl(format: "excel" | "pdf") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("format", format);
    params.delete("page");
    return `/api/admin/mahasiswa/export?${params.toString()}`;
  }

  return (
    <div className={cn("flex flex-col gap-3 transition-opacity sm:flex-row sm:items-center sm:justify-between", isPending && "opacity-60")}>
      <div className="flex flex-1 flex-col gap-2 sm:flex-row">
        <form onSubmit={handleSearchSubmit} className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau NIM..."
            className="pl-9"
          />
        </form>

        <Select defaultValue={searchParams.get("status") ?? "SEMUA"} onValueChange={(v) => updateParam("status", v)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SEMUA">Semua Status</SelectItem>
            {STATUS_AKADEMIK_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_AKADEMIK_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onImportClick}>
          <Upload className="h-4 w-4" /> Import
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <a href={exportUrl("excel")}>
                <FileSpreadsheet className="h-4 w-4" /> Export Excel
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={exportUrl("pdf")}>
                <FileText className="h-4 w-4" /> Export PDF
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" onClick={onAddClick}>
          <Plus className="h-4 w-4" /> Tambah Mahasiswa
        </Button>
      </div>
    </div>
  );
}
