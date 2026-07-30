"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { JadwalToolbar } from "@/components/admin/jadwal/jadwal-toolbar";
import { JadwalTable } from "@/components/admin/jadwal/jadwal-table";
import { JadwalFormDialog } from "@/components/admin/jadwal/jadwal-form-dialog";
import { JadwalDeleteDialog } from "@/components/admin/jadwal/jadwal-delete-dialog";
import { PaginationBar } from "@/components/shared/pagination-bar";
import type { ScheduleRecord, CourseOption } from "@/lib/types/schedule";

interface JadwalPageClientProps {
  schedules: ScheduleRecord[];
  courseOptions: CourseOption[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export function JadwalPageClient({ schedules, courseOptions, page, totalPages, total, pageSize }: JadwalPageClientProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleRecord | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingSchedule, setDeletingSchedule] = useState<ScheduleRecord | null>(null);

  return (
    <>
      <Card>
        <CardContent className="space-y-4 p-5">
          <JadwalToolbar
            onAddClick={() => {
              setEditingSchedule(null);
              setFormOpen(true);
            }}
          />
          <JadwalTable
            schedules={schedules}
            onEdit={(s) => {
              setEditingSchedule(s);
              setFormOpen(true);
            }}
            onDelete={(s) => {
              setDeletingSchedule(s);
              setDeleteOpen(true);
            }}
          />
          <PaginationBar page={page} totalPages={totalPages} total={total} pageSize={pageSize} />
        </CardContent>
      </Card>

      <JadwalFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        schedule={editingSchedule}
        courseOptions={courseOptions}
      />
      <JadwalDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} schedule={deletingSchedule} />
    </>
  );
}
