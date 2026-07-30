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
import { HARI_LABEL } from "@/lib/academic-options";
import { deleteSchedule } from "@/app/admin/jadwal/actions";
import type { ScheduleRecord } from "@/lib/types/schedule";

interface JadwalDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: ScheduleRecord | null;
}

export function JadwalDeleteDialog({ open, onOpenChange, schedule }: JadwalDeleteDialogProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!schedule) return;
    setDeleting(true);
    try {
      const result = await deleteSchedule(schedule.id);
      if (!result.success) {
        toast.error(result.error ?? "Gagal menghapus data.");
        return;
      }
      toast.success("Jadwal berhasil dihapus.");
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
          <AlertDialogTitle>Hapus jadwal ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Jadwal <strong>{schedule?.course.nama}</strong> pada{" "}
            <strong>{schedule ? HARI_LABEL[schedule.hari] : ""}</strong>, {schedule?.jamMulai}–{schedule?.jamSelesai}{" "}
            di {schedule?.ruangan} akan dihapus permanen.
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
