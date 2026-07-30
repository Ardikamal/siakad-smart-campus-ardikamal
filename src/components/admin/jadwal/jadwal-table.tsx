"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HARI_LABEL } from "@/lib/academic-options";
import type { ScheduleRecord } from "@/lib/types/schedule";

interface JadwalTableProps {
  schedules: ScheduleRecord[];
  onEdit: (schedule: ScheduleRecord) => void;
  onDelete: (schedule: ScheduleRecord) => void;
}

export function JadwalTable({ schedules, onEdit, onDelete }: JadwalTableProps) {
  if (schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="font-medium text-foreground">Belum ada jadwal</p>
        <p className="text-sm text-muted-foreground">Coba ubah filter hari, atau tambahkan jadwal baru.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Hari</TableHead>
          <TableHead>Jam</TableHead>
          <TableHead>Mata Kuliah</TableHead>
          <TableHead>Ruangan</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedules.map((s) => (
          <TableRow key={s.id}>
            <TableCell>
              <Badge variant="outline">{HARI_LABEL[s.hari] ?? s.hari}</Badge>
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {s.jamMulai}–{s.jamSelesai}
            </TableCell>
            <TableCell className="font-medium text-foreground">
              {s.course.nama} <span className="font-mono text-xs text-muted-foreground">({s.course.kode})</span>
            </TableCell>
            <TableCell className="text-muted-foreground">{s.ruangan}</TableCell>
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
                  <DropdownMenuItem onClick={() => onDelete(s)} className="text-danger focus:bg-danger/10 focus:text-danger">
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
