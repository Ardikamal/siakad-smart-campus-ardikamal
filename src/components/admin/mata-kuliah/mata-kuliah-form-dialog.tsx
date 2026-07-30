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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createCourse, updateCourse } from "@/app/admin/mata-kuliah/actions";
import type { CourseRecord } from "@/lib/types/course";

const formSchema = z.object({
  kode: z.string().min(1, "Kode wajib diisi"),
  nama: z.string().min(1, "Nama wajib diisi"),
  sks: z.string().min(1, "SKS wajib diisi"),
  semester: z.string().min(1, "Semester wajib diisi"),
  dosen: z.string().min(1, "Nama dosen wajib diisi"),
});
type FormValues = z.infer<typeof formSchema>;

interface MataKuliahFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: CourseRecord | null;
}

export function MataKuliahFormDialog({ open, onOpenChange, course }: MataKuliahFormDialogProps) {
  const router = useRouter();
  const isEdit = Boolean(course);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { kode: "", nama: "", sks: "3", semester: "1", dosen: "" },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      kode: course?.kode ?? "",
      nama: course?.nama ?? "",
      sks: course ? String(course.sks) : "3",
      semester: course ? String(course.semester) : "1",
      dosen: course?.dosen ?? "",
    });
  }, [open, course, form]);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const payload = {
        kode: values.kode,
        nama: values.nama,
        sks: Number(values.sks),
        semester: Number(values.semester),
        dosen: values.dosen,
      };
      const result = isEdit && course ? await updateCourse({ id: course.id, ...payload }) : await createCourse(payload);

      if (!result.success) {
        toast.error(result.error ?? "Gagal menyimpan data.");
        return;
      }

      toast.success(isEdit ? "Mata kuliah diperbarui." : "Mata kuliah baru ditambahkan.");
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
          <DialogTitle>{isEdit ? "Edit Mata Kuliah" : "Tambah Mata Kuliah"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Perbarui detail mata kuliah." : "Tambahkan mata kuliah baru ke kurikulum."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="kode">Kode Mata Kuliah</Label>
              <Input id="kode" placeholder="IF101" {...form.register("kode")} />
              {form.formState.errors.kode && <p className="text-xs text-danger">{form.formState.errors.kode.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dosen">Dosen Pengampu</Label>
              <Input id="dosen" placeholder="Nama dosen" {...form.register("dosen")} />
              {form.formState.errors.dosen && <p className="text-xs text-danger">{form.formState.errors.dosen.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nama">Nama Mata Kuliah</Label>
            <Input id="nama" placeholder="Algoritma dan Pemrograman" {...form.register("nama")} />
            {form.formState.errors.nama && <p className="text-xs text-danger">{form.formState.errors.nama.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="sks">SKS</Label>
              <Input id="sks" type="number" min={1} max={6} {...form.register("sks")} />
              {form.formState.errors.sks && <p className="text-xs text-danger">{form.formState.errors.sks.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="semester">Semester</Label>
              <Input id="semester" type="number" min={1} max={8} {...form.register("semester")} />
              {form.formState.errors.semester && (
                <p className="text-xs text-danger">{form.formState.errors.semester.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Mata Kuliah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
