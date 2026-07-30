"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEMESTER_OPTIONS } from "@/lib/academic-options";
import { cn } from "@/lib/utils";

interface MataKuliahToolbarProps {
  onAddClick: () => void;
}

export function MataKuliahToolbar({ onAddClick }: MataKuliahToolbarProps) {
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

  return (
    <div
      className={cn(
        "flex flex-col gap-3 transition-opacity sm:flex-row sm:items-center sm:justify-between",
        isPending && "opacity-60"
      )}
    >
      <div className="flex flex-1 flex-col gap-2 sm:flex-row">
        <form onSubmit={handleSearchSubmit} className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode, nama, atau dosen..."
            className="pl-9"
          />
        </form>

        <Select defaultValue={searchParams.get("semester") ?? "SEMUA"} onValueChange={(v) => updateParam("semester", v)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SEMUA">Semua Semester</SelectItem>
            {SEMESTER_OPTIONS.map((s) => (
              <SelectItem key={s} value={String(s)}>
                Semester {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button size="sm" onClick={onAddClick}>
        <Plus className="h-4 w-4" /> Tambah Mata Kuliah
      </Button>
    </div>
  );
}
