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
import { deleteCourse } from "@/app/admin/mata-kuliah/actions";
import type { CourseRecord } from "@/lib/types/course";

interface MataKuliahDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: CourseRecord | null;
}

export function MataKuliahDeleteDialog({ open, onOpenChange, course }: MataKuliahDeleteDialogProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const impactParts: string[] = [];
  if (course?._count) {
    if (course._count.schedules > 0) impactParts.push(`${course._count.schedules} jadwal`);
    if (course._count.krsList > 0) impactParts.push(`${course._count.krsList} baris KRS`);
    if (course._count.grades > 0) impactParts.push(`${course._count.grades} nilai mahasiswa`);
  }

  async function handleDelete() {
    if (!course) return;
    setDeleting(true);
    try {
      const result = await deleteCourse(course.id);
      if (!result.success) {
        toast.error(result.error ?? "Gagal menghapus data.");
        return;
      }
      toast.success(`Mata kuliah ${course.nama} berhasil dihapus.`);
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
          <AlertDialogTitle>Hapus mata kuliah?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{course?.nama}</strong> ({course?.kode}) akan dihapus permanen.
            {impactParts.length > 0 ? (
              <>
                {" "}
                Ini juga akan menghapus <strong>{impactParts.join(", ")}</strong> yang terkait mata kuliah ini.
              </>
            ) : (
              " Belum ada jadwal, KRS, atau nilai yang terkait."
            )}{" "}
            Tindakan ini tidak bisa dibatalkan.
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
