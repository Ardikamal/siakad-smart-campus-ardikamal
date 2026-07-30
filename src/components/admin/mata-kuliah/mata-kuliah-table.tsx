"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { CourseRecord } from "@/lib/types/course";

interface MataKuliahTableProps {
  courses: CourseRecord[];
  onEdit: (course: CourseRecord) => void;
  onDelete: (course: CourseRecord) => void;
}

const COLUMNS: { key: "kode" | "nama" | "sks" | "semester" | "dosen"; label: string }[] = [
  { key: "kode", label: "Kode" },
  { key: "nama", label: "Nama Mata Kuliah" },
  { key: "sks", label: "SKS" },
  { key: "semester", label: "Semester" },
  { key: "dosen", label: "Dosen" },
];

export function MataKuliahTable({ courses, onEdit, onDelete }: MataKuliahTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSortBy = searchParams.get("sortBy") ?? "semester";
  const currentSortOrder = searchParams.get("sortOrder") ?? "asc";

  function toggleSort(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (currentSortBy === key) {
      params.set("sortOrder", currentSortOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", key);
      params.set("sortOrder", "asc");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function SortIcon({ column }: { column: string }) {
    if (currentSortBy !== column) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return currentSortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="font-medium text-foreground">Tidak ada mata kuliah</p>
        <p className="text-sm text-muted-foreground">Coba ubah kata kunci pencarian atau filter semester.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {COLUMNS.map((col) => (
            <TableHead key={col.key}>
              <button onClick={() => toggleSort(col.key)} className="flex items-center gap-1 transition-colors hover:text-foreground">
                {col.label} <SortIcon column={col.key} />
              </button>
            </TableHead>
          ))}
          <TableHead>Terpakai Di</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((c) => (
          <TableRow key={c.id}>
            <TableCell className="font-mono text-xs">{c.kode}</TableCell>
            <TableCell className="font-medium text-foreground">{c.nama}</TableCell>
            <TableCell className="text-muted-foreground">{c.sks}</TableCell>
            <TableCell className="text-muted-foreground">{c.semester}</TableCell>
            <TableCell className="text-muted-foreground">{c.dosen}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                <Badge variant="muted">{c._count?.schedules ?? 0} jadwal</Badge>
                <Badge variant="muted">{c._count?.krsList ?? 0} KRS</Badge>
                <Badge variant="muted">{c._count?.grades ?? 0} nilai</Badge>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Menu aksi">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(c)}>
                    <Pencil className="h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(c)} className="text-danger focus:bg-danger/10 focus:text-danger">
                    <Trash2 className="h-4 w-4" /> Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
