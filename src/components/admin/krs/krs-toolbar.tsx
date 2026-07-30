"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STATUS_FILTER_OPTIONS = [
  { value: "SEMUA", label: "Semua Status" },
  { value: "DIAJUKAN", label: "Diajukan" },
  { value: "DISETUJUI", label: "Disetujui" },
  { value: "DITOLAK", label: "Ditolak" },
];

export function KrsToolbar() {
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
    <div className={cn("flex flex-col gap-3 transition-opacity sm:flex-row sm:items-center", isPending && "opacity-60")}>
      <form onSubmit={handleSearchSubmit} className="relative max-w-xs flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau NIM mahasiswa..."
          className="pl-9"
        />
      </form>

      <Select defaultValue={searchParams.get("status") ?? "SEMUA"} onValueChange={(v) => updateParam("status", v)}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
