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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRODI_OPTIONS, STATUS_AKADEMIK_LABEL, STATUS_AKADEMIK_OPTIONS } from "@/lib/academic-options";
import { createStudent, updateStudent } from "@/app/admin/mahasiswa/actions";
import type { StudentRecord } from "@/lib/types/student";

const formSchema = z.object({
  nim: z.string().min(1, "NIM wajib diisi"),
  fullName: z.string().min(1, "Nama lengkap wajib diisi"),
  prodi: z.enum(PRODI_OPTIONS),
  angkatan: z.string().min(4, "Angkatan wajib diisi"),
  statusAkademik: z.enum(STATUS_AKADEMIK_OPTIONS),
  password: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

interface MahasiswaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: StudentRecord | null;
}

export function MahasiswaFormDialog({ open, onOpenChange, student }: MahasiswaFormDialogProps) {
  const router = useRouter();
  const isEdit = Boolean(student);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nim: "",
      fullName: "",
      prodi: PRODI_OPTIONS[0],
      angkatan: String(new Date().getFullYear()),
      statusAkademik: "AKTIF",
      password: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      nim: student?.nim ?? "",
      fullName: student?.fullName ?? "",
      prodi: (student?.prodi as (typeof PRODI_OPTIONS)[number]) ?? PRODI_OPTIONS[0],
      angkatan: student ? String(student.angkatan) : String(new Date().getFullYear()),
      statusAkademik: (student?.statusAkademik as (typeof STATUS_AKADEMIK_OPTIONS)[number]) ?? "AKTIF",
      password: "",
    });
  }, [open, student, form]);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const result =
        isEdit && student
          ? await updateStudent({
              id: student.id,
              nim: values.nim,
              fullName: values.fullName,
              prodi: values.prodi,
              angkatan: Number(values.angkatan),
              statusAkademik: values.statusAkademik,
            })
          : await createStudent({
              nim: values.nim,
              fullName: values.fullName,
              prodi: values.prodi,
              angkatan: Number(values.angkatan),
              statusAkademik: values.statusAkademik,
              password: values.password || "Mahasiswa@123",
            });

      if (!result.success) {
        toast.error(result.error ?? "Gagal menyimpan data.");
        return;
      }

      toast.success(isEdit ? "Data mahasiswa diperbarui." : "Mahasiswa baru ditambahkan.");
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
          <DialogTitle>{isEdit ? "Edit Mahasiswa" : "Tambah Mahasiswa"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui data akademik mahasiswa."
              : "Buat akun mahasiswa baru beserta profil akademiknya."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nim">NIM</Label>
              <Input id="nim" placeholder="2312301001" {...form.register("nim")} />
              {form.formState.errors.nim && (
                <p className="text-xs text-danger">{form.formState.errors.nim.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="angkatan">Angkatan</Label>
              <Input id="angkatan" type="number" {...form.register("angkatan")} />
              {form.formState.errors.angkatan && (
                <p className="text-xs text-danger">{form.formState.errors.angkatan.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input id="fullName" placeholder="Nama lengkap mahasiswa" {...form.register("fullName")} />
            {form.formState.errors.fullName && (
              <p className="text-xs text-danger">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Program Studi</Label>
              <Select
                value={form.watch("prodi")}
                onValueChange={(v) => form.setValue("prodi", v as (typeof PRODI_OPTIONS)[number], { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODI_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status Akademik</Label>
              <Select
                value={form.watch("statusAkademik")}
                onValueChange={(v) =>
                  form.setValue("statusAkademik", v as (typeof STATUS_AKADEMIK_OPTIONS)[number], { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_AKADEMIK_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_AKADEMIK_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="password">Password Awal</Label>
              <Input
                id="password"
                placeholder="Kosongkan untuk pakai default: Mahasiswa@123"
                {...form.register("password")}
              />
              <p className="text-xs text-muted-foreground">
                Sampaikan password ini ke mahasiswa secara langsung setelah akun dibuat.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Mahasiswa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
