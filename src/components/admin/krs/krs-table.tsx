"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approveKrs, rejectKrs } from "@/app/admin/krs/actions";
import type { KrsAdminRow } from "@/lib/types/krs";

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger"> = {
  DIAJUKAN: "warning",
  DISETUJUI: "success",
  DITOLAK: "danger",
};
const STATUS_LABEL: Record<string, string> = {
  DIAJUKAN: "Diajukan",
  DISETUJUI: "Disetujui",
  DITOLAK: "Ditolak",
};

interface KrsTableProps {
  rows: KrsAdminRow[];
}

export function KrsTable({ rows }: KrsTableProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleApprove(id: string) {
    setPendingId(id);
    startTransition(async () => {
      const result = await approveKrs(id);
      if (!result.success) toast.error(result.error ?? "Gagal menyetujui.");
      else toast.success("KRS disetujui.");
      setPendingId(null);
    });
  }

  function handleReject(id: string) {
    setPendingId(id);
    startTransition(async () => {
      const result = await rejectKrs(id);
      if (!result.success) toast.error(result.error ?? "Gagal menolak.");
      else toast.success("KRS ditolak.");
      setPendingId(null);
    });
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="font-medium text-foreground">Tidak ada pengajuan KRS</p>
        <p className="text-sm text-muted-foreground">Coba ubah kata kunci pencarian atau filter status.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mahasiswa</TableHead>
          <TableHead>Mata Kuliah</TableHead>
          <TableHead>SKS</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <p className="font-medium text-foreground">{row.student.fullName}</p>
              <p className="font-mono text-xs text-muted-foreground">{row.student.nim}</p>
            </TableCell>
            <TableCell>
              <p className="text-foreground">{row.course.nama}</p>
              <p className="font-mono text-xs text-muted-foreground">{row.course.kode}</p>
            </TableCell>
            <TableCell className="text-muted-foreground">{row.course.sks}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Badge>
            </TableCell>
            <TableCell className="text-right">
              {row.status === "DIAJUKAN" ? (
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApprove(row.id)}
                    disabled={pendingId === row.id}
                    className="text-success hover:bg-success/10 hover:text-success"
                  >
                    <Check className="h-4 w-4" /> Setujui
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(row.id)}
                    disabled={pendingId === row.id}
                    className="text-danger hover:bg-danger/10 hover:text-danger"
                  >
                    <X className="h-4 w-4" /> Tolak
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Sudah diproses</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
