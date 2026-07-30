"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AcademicYearOption {
  id: string;
  tahun: string;
  semester: string;
}

interface KhsYearSelectorProps {
  academicYears: AcademicYearOption[];
  selectedYearId?: string;
}

export function KhsYearSelector({ academicYears, selectedYearId }: KhsYearSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("academicYearId", value);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <div className={cn("w-full max-w-xs transition-opacity", isPending && "opacity-60")}>
      <Select value={selectedYearId} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Pilih semester" />
        </SelectTrigger>
        <SelectContent>
          {academicYears.map((ay) => (
            <SelectItem key={ay.id} value={ay.id}>
              {ay.tahun} {ay.semester === "GANJIL" ? "Ganjil" : "Genap"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
