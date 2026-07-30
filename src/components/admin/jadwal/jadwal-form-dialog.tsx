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
import { HARI_LABEL, HARI_OPTIONS } from "@/lib/academic-options";
import { createSchedule, updateSchedule } from "@/app/admin/jadwal/actions";
import type { ScheduleRecord, CourseOption } from "@/lib/types/schedule";

const formSchema = z.object({
  courseId: z.string().min(1, "Pilih mata kuliah"),
  hari: z.enum(HARI_OPTIONS),
  jamMulai: z.string().min(1, "Jam mulai wajib diisi"),
  jamSelesai: z.string().min(1, "Jam selesai wajib diisi"),
  ruangan: z.string().min(1, "Ruangan wajib diisi"),
});
type FormValues = z.infer<typeof formSchema>;

interface JadwalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: ScheduleRecord | null;
  courseOptions: CourseOption[];
}

export function JadwalFormDialog({ open, onOpenChange, schedule, courseOptions }: JadwalFormDialogProps) {
  const router = useRouter();
  const isEdit = Boolean(schedule);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: "",
      hari: "SENIN",
      jamMulai: "08:00",
      jamSelesai: "09:40",
      ruangan: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      courseId: schedule?.courseId ?? courseOptions[0]?.id ?? "",
      hari: (schedule?.hari as (typeof HARI_OPTIONS)[number]) ?? "SENIN",
      jamMulai: schedule?.jamMulai ?? "08:00",
      jamSelesai: schedule?.jamSelesai ?? "09:40",
      ruangan: schedule?.ruangan ?? "",
    });
  }, [open, schedule, courseOptions, form]);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const result =
        isEdit && schedule ? await updateSchedule({ id: schedule.id, ...values }) : await createSchedule(values);

      if (!result.success) {
        toast.error(result.error ?? "Gagal menyimpan data.");
        return;
      }

      toast.success(isEdit ? "Jadwal diperbarui." : "Jadwal baru ditambahkan.");
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
          <DialogTitle>{isEdit ? "Edit Jadwal" : "Tambah Jadwal"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Perbarui jadwal kuliah." : "Tentukan hari, jam, dan ruangan untuk mata kuliah."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label>Mata Kuliah</Label>
            <Select value={form.watch("courseId")} onValueChange={(v) => form.setValue("courseId", v, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih mata kuliah" />
              </SelectTrigger>
              <SelectContent>
                {courseOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.kode} — {c.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {courseOptions.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Belum ada mata kuliah. Tambahkan mata kuliah terlebih dahulu di menu Mata Kuliah.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Hari</Label>
            <Select
              value={form.watch("hari")}
              onValueChange={(v) => form.setValue("hari", v as (typeof HARI_OPTIONS)[number], { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HARI_OPTIONS.map((h) => (
                  <SelectItem key={h} value={h}>
                    {HARI_LABEL[h]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="jamMulai">Jam Mulai</Label>
              <Input id="jamMulai" type="time" {...form.register("jamMulai")} />
              {form.formState.errors.jamMulai && (
                <p className="text-xs text-danger">{form.formState.errors.jamMulai.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="jamSelesai">Jam Selesai</Label>
              <Input id="jamSelesai" type="time" {...form.register("jamSelesai")} />
              {form.formState.errors.jamSelesai && (
                <p className="text-xs text-danger">{form.formState.errors.jamSelesai.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ruangan">Ruangan</Label>
            <Input id="ruangan" placeholder="Ruang B201 / Lab. Komputer 1" {...form.register("ruangan")} />
            {form.formState.errors.ruangan && (
              <p className="text-xs text-danger">{form.formState.errors.ruangan.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting || courseOptions.length === 0}>
              {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Jadwal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
