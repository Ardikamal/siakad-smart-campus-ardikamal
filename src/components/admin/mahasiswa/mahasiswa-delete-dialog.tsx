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
import { deleteStudent } from "@/app/admin/mahasiswa/actions";
import type { StudentRecord } from "@/lib/types/student";

interface MahasiswaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentRecord | null;
}

export function MahasiswaDeleteDialog({ open, onOpenChange, student }: MahasiswaDeleteDialogProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!student) return;
    setDeleting(true);
    try {
      const result = await deleteStudent(student.id);
      if (!result.success) {
        toast.error(result.error ?? "Gagal menghapus data.");
        return;
      }
      toast.success(`Data ${student.fullName} berhasil dihapus.`);
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
          <AlertDialogTitle>Hapus data mahasiswa?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini akan menghapus akun <strong>{student?.fullName}</strong> ({student?.nim}) beserta
            seluruh riwayat KRS dan nilai yang terkait. Data yang sudah dihapus tidak bisa dikembalikan.
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
