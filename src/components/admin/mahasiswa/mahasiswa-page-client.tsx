"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MahasiswaToolbar } from "@/components/admin/mahasiswa/mahasiswa-toolbar";
import { MahasiswaTable } from "@/components/admin/mahasiswa/mahasiswa-table";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { MahasiswaFormDialog } from "@/components/admin/mahasiswa/mahasiswa-form-dialog";
import { MahasiswaDeleteDialog } from "@/components/admin/mahasiswa/mahasiswa-delete-dialog";
import { MahasiswaImportDialog } from "@/components/admin/mahasiswa/mahasiswa-import-dialog";
import type { StudentRecord } from "@/lib/types/student";

interface MahasiswaPageClientProps {
  students: StudentRecord[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export function MahasiswaPageClient({ students, page, totalPages, total, pageSize }: MahasiswaPageClientProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<StudentRecord | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="space-y-4 p-5">
          <MahasiswaToolbar
            onAddClick={() => {
              setEditingStudent(null);
              setFormOpen(true);
            }}
            onImportClick={() => setImportOpen(true)}
          />
          <MahasiswaTable
            students={students}
            onEdit={(s) => {
              setEditingStudent(s);
              setFormOpen(true);
            }}
            onDelete={(s) => {
              setDeletingStudent(s);
              setDeleteOpen(true);
            }}
          />
          <PaginationBar page={page} totalPages={totalPages} total={total} pageSize={pageSize} />
        </CardContent>
      </Card>

      <MahasiswaFormDialog open={formOpen} onOpenChange={setFormOpen} student={editingStudent} />
      <MahasiswaDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} student={deletingStudent} />
      <MahasiswaImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </>
  );
}
