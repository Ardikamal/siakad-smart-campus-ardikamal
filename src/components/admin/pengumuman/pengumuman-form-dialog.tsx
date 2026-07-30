"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createAnnouncement, updateAnnouncement } from "@/app/admin/pengumuman/actions";
import type { AnnouncementRecord } from "@/lib/types/announcement";

const formSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  konten: z.string().min(1, "Konten wajib diisi"),
});
type FormValues = z.infer<typeof formSchema>;

interface PengumumanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: AnnouncementRecord | null;
}

export function PengumumanFormDialog({ open, onOpenChange, announcement }: PengumumanFormDialogProps) {
  const router = useRouter();
  const isEdit = Boolean(announcement);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { judul: "", konten: "" },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ judul: announcement?.judul ?? "", konten: announcement?.konten ?? "" });
  }, [open, announcement, form]);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const result =
        isEdit && announcement
          ? await updateAnnouncement({ id: announcement.id, ...values })
          : await createAnnouncement(values);

      if (!result.success) {
        toast.error(result.error ?? "Gagal menyimpan pengumuman.");
        return;
      }

      toast.success(isEdit ? "Pengumuman diperbarui." : "Pengumuman baru ditambahkan.");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Pengumuman" : "Tambah Pengumuman"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Perbarui isi pengumuman." : "Pengumuman akan langsung tampil di dashboard mahasiswa."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="judul">Judul</Label>
            <Input id="judul" placeholder="Judul pengumuman" {...form.register("judul")} />
            {form.formState.errors.judul && <p className="text-xs text-danger">{form.formState.errors.judul.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="konten">Isi Pengumuman</Label>
            <Textarea id="konten" placeholder="Tulis isi pengumuman..." rows={5} {...form.register("konten")} />
            {form.formState.errors.konten && <p className="text-xs text-danger">{form.formState.errors.konten.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Pengumuman"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
