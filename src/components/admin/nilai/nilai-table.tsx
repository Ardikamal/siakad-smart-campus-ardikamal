"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getGradeInfo } from "@/lib/academic";
import { saveGrade } from "@/app/admin/nilai/actions";
import type { StudentForGrading } from "@/lib/queries/nilai-admin";

interface NilaiTableProps {
  students: StudentForGrading[];
  courseId: string;
  academicYearId: string;
}

function NilaiRow({
  student,
  courseId,
  academicYearId,
}: {
  student: StudentForGrading;
  courseId: string;
  academicYearId: string;
}) {
  const [value, setValue] = useState(
    student.existingGrade ? String(student.existingGrade.nilaiAngka) : ""
  );
  const [saving, setSaving] = useState(false);

  const numeric = value === "" ? null : Number(value);
  const preview = numeric !== null && !Number.isNaN(numeric) ? getGradeInfo(numeric) : null;

  async function handleSave() {
    if (numeric === null || Number.isNaN(numeric)) {
      toast.error("Masukkan nilai angka yang valid.");
      return;
    }
    setSaving(true);
    try {
      const result = await saveGrade({
        studentId: student.studentId,
        courseId,
        academicYearId,
        nilaiAngka: numeric,
      });
      if (!result.success) {
        toast.error(result.error ?? "Gagal menyimpan nilai.");
      } else {
        toast.success(`Nilai ${student.fullName} disimpan.`);
      }
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <TableRow>
      <TableCell className="font-medium text-foreground">{student.fullName}</TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">{student.nim}</TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0-100"
          className="w-24"
        />
      </TableCell>
      <TableCell>
        {preview ? <Badge variant="outline">{preview.nilaiHuruf}</Badge> : <span className="text-xs text-muted-foreground">—</span>}
      </TableCell>
      <TableCell className="text-muted-foreground">{preview ? preview.bobot.toFixed(1) : "—"}</TableCell>
      <TableCell className="text-right">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function NilaiTable({ students, courseId, academicYearId }: NilaiTableProps) {
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="font-medium text-foreground">Belum ada mahasiswa untuk dinilai</p>
        <p className="text-sm text-muted-foreground">
          Hanya mahasiswa dengan KRS berstatus &quot;Disetujui&quot; untuk kombinasi ini yang muncul di sini.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>NIM</TableHead>
          <TableHead>Nilai Angka</TableHead>
          <TableHead>Huruf</TableHead>
          <TableHead>Bobot</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((s) => (
          <NilaiRow key={s.studentId} student={s} courseId={courseId} academicYearId={academicYearId} />
        ))}
      </TableBody>
    </Table>
  );
}
