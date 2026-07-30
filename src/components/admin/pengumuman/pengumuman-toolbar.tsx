"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PengumumanToolbarProps {
  onAddClick: () => void;
}

export function PengumumanToolbar({ onAddClick }: PengumumanToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) params.set("search", search);
    else params.delete("search");
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <div className={cn("flex flex-col gap-3 transition-opacity sm:flex-row sm:items-center sm:justify-between", isPending && "opacity-60")}>
      <form onSubmit={handleSearchSubmit} className="relative max-w-xs flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari judul atau isi pengumuman..."
          className="pl-9"
        />
      </form>
      <Button size="sm" onClick={onAddClick}>
        <Plus className="h-4 w-4" /> Tambah Pengumuman
      </Button>
    </div>
  );
}
