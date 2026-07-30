"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MataKuliahToolbar } from "@/components/admin/mata-kuliah/mata-kuliah-toolbar";
import { MataKuliahTable } from "@/components/admin/mata-kuliah/mata-kuliah-table";
import { MataKuliahFormDialog } from "@/components/admin/mata-kuliah/mata-kuliah-form-dialog";
import { MataKuliahDeleteDialog } from "@/components/admin/mata-kuliah/mata-kuliah-delete-dialog";
import { PaginationBar } from "@/components/shared/pagination-bar";
import type { CourseRecord } from "@/lib/types/course";

interface MataKuliahPageClientProps {
  courses: CourseRecord[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export function MataKuliahPageClient({ courses, page, totalPages, total, pageSize }: MataKuliahPageClientProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseRecord | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<CourseRecord | null>(null);

  return (
    <>
      <Card>
        <CardContent className="space-y-4 p-5">
          <MataKuliahToolbar
            onAddClick={() => {
              setEditingCourse(null);
              setFormOpen(true);
            }}
          />
          <MataKuliahTable
            courses={courses}
            onEdit={(c) => {
              setEditingCourse(c);
              setFormOpen(true);
            }}
            onDelete={(c) => {
              setDeletingCourse(c);
              setDeleteOpen(true);
            }}
          />
          <PaginationBar page={page} totalPages={totalPages} total={total} pageSize={pageSize} />
        </CardContent>
      </Card>

      <MataKuliahFormDialog open={formOpen} onOpenChange={setFormOpen} course={editingCourse} />
      <MataKuliahDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} course={deletingCourse} />
    </>
  );
}
