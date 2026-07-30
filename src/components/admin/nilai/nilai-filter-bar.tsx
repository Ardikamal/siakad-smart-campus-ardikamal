"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AcademicYearOption {
  id: string;
  tahun: string;
  semester: string;
  isActive: boolean;
}
interface CourseOption {
  id: string;
  kode: string;
  nama: string;
}

interface NilaiFilterBarProps {
  academicYears: AcademicYearOption[];
  courses: CourseOption[];
  selectedYearId?: string;
  selectedCourseId?: string;
}

export function NilaiFilterBar({ academicYears, courses, selectedYearId, selectedCourseId }: NilaiFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row transition-opacity", isPending && "opacity-60")}>
      <div className="flex-1 space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Tahun Akademik</label>
        <Select value={selectedYearId} onValueChange={(v) => updateParam("academicYearId", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih tahun akademik" />
          </SelectTrigger>
          <SelectContent>
            {academicYears.map((ay) => (
              <SelectItem key={ay.id} value={ay.id}>
                {ay.tahun} {ay.semester === "GANJIL" ? "Ganjil" : "Genap"} {ay.isActive ? "(Aktif)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Mata Kuliah</label>
        <Select value={selectedCourseId} onValueChange={(v) => updateParam("courseId", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih mata kuliah" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.kode} — {c.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
