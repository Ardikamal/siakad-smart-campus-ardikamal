"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HARI_LABEL, HARI_OPTIONS } from "@/lib/academic-options";
import { cn } from "@/lib/utils";

interface JadwalToolbarProps {
  onAddClick: () => void;
}

export function JadwalToolbar({ onAddClick }: JadwalToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateHari(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "SEMUA") {
      params.set("hari", value);
    } else {
      params.delete("hari");
    }
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <div className={cn("flex flex-col gap-3 transition-opacity sm:flex-row sm:items-center sm:justify-between", isPending && "opacity-60")}>
      <Select defaultValue={searchParams.get("hari") ?? "SEMUA"} onValueChange={updateHari}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Hari" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="SEMUA">Semua Hari</SelectItem>
          {HARI_OPTIONS.map((h) => (
            <SelectItem key={h} value={h}>
              {HARI_LABEL[h]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button size="sm" onClick={onAddClick}>
        <Plus className="h-4 w-4" /> Tambah Jadwal
      </Button>
    </div>
  );
}
