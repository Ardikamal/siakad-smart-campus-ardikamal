"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteAnnouncement } from "@/app/admin/pengumuman/actions";
import type { AnnouncementRecord } from "@/lib/types/announcement";

interface PengumumanDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: AnnouncementRecord | null;
}

export function PengumumanDeleteDialog({ open, onOpenChange, announcement }: PengumumanDeleteDialogProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!announcement) return;
    setDeleting(true);
    try {
      const result = await deleteAnnouncement(announcement.id);
      if (!result.success) {
        toast.error(result.error ?? "Gagal menghapus pengumuman.");
        return;
      }
      toast.success("Pengumuman berhasil dihapus.");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus pengumuman?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{announcement?.judul}</strong> akan dihapus permanen dan tidak lagi tampil di dashboard mahasiswa.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleting}>
            {deleting ? "Menghapus..." : "Ya, Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
