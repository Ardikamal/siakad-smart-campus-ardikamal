"use client";

import { useState } from "react";
import { PengumumanToolbar } from "@/components/admin/pengumuman/pengumuman-toolbar";
import { PengumumanTable } from "@/components/admin/pengumuman/pengumuman-table";
import { PengumumanFormDialog } from "@/components/admin/pengumuman/pengumuman-form-dialog";
import { PengumumanDeleteDialog } from "@/components/admin/pengumuman/pengumuman-delete-dialog";
import { PaginationBar } from "@/components/shared/pagination-bar";
import type { AnnouncementRecord } from "@/lib/types/announcement";

interface PengumumanPageClientProps {
  announcements: AnnouncementRecord[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export function PengumumanPageClient({ announcements, page, totalPages, total, pageSize }: PengumumanPageClientProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AnnouncementRecord | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<AnnouncementRecord | null>(null);

  return (
    <div className="space-y-4">
      <PengumumanToolbar
        onAddClick={() => {
          setEditing(null);
          setFormOpen(true);
        }}
      />
      <PengumumanTable
        announcements={announcements}
        onEdit={(a) => {
          setEditing(a);
          setFormOpen(true);
        }}
        onDelete={(a) => {
          setDeleting(a);
          setDeleteOpen(true);
        }}
      />
      <PaginationBar page={page} totalPages={totalPages} total={total} pageSize={pageSize} />

      <PengumumanFormDialog open={formOpen} onOpenChange={setFormOpen} announcement={editing} />
      <PengumumanDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} announcement={deleting} />
    </div>
  );
}
