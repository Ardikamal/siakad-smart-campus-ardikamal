"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { STATUS_AKADEMIK_BADGE_VARIANT, STATUS_AKADEMIK_LABEL } from "@/lib/academic-options";
import type { StudentRecord } from "@/lib/types/student";

interface MahasiswaTableProps {
  students: StudentRecord[];
  onEdit: (student: StudentRecord) => void;
  onDelete: (student: StudentRecord) => void;
}

const COLUMNS: { key: "nim" | "fullName" | "prodi" | "angkatan"; label: string }[] = [
  { key: "nim", label: "NIM" },
  { key: "fullName", label: "Nama Lengkap" },
  { key: "prodi", label: "Program Studi" },
  { key: "angkatan", label: "Angkatan" },
];

export function MahasiswaTable({ students, onEdit, onDelete }: MahasiswaTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSortBy = searchParams.get("sortBy") ?? "fullName";
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

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="font-medium text-foreground">Tidak ada data mahasiswa</p>
        <p className="text-sm text-muted-foreground">Coba ubah kata kunci pencarian atau filter status.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {COLUMNS.map((col) => (
            <TableHead key={col.key}>
              <button
                onClick={() => toggleSort(col.key)}
                className="flex items-center gap-1 transition-colors hover:text-foreground"
              >
                {col.label} <SortIcon column={col.key} />
              </button>
            </TableHead>
          ))}
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((s) => (
          <TableRow key={s.id}>
            <TableCell className="font-mono text-xs">{s.nim}</TableCell>
            <TableCell className="font-medium text-foreground">{s.fullName}</TableCell>
            <TableCell className="text-muted-foreground">{s.prodi}</TableCell>
            <TableCell className="text-muted-foreground">{s.angkatan}</TableCell>
            <TableCell>
              <Badge variant={STATUS_AKADEMIK_BADGE_VARIANT[s.statusAkademik]}>
                {STATUS_AKADEMIK_LABEL[s.statusAkademik]}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Menu aksi">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(s)}>
                    <Pencil className="h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(s)}
                    className="text-danger focus:bg-danger/10 focus:text-danger"
                  >
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
