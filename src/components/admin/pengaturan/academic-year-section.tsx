"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createAcademicYear, setActiveAcademicYear } from "@/app/admin/pengaturan/actions";

interface AcademicYearItem {
  id: string;
  tahun: string;
  semester: string;
  isActive: boolean;
}

const formSchema = z.object({
  tahun: z.string().min(1, "Wajib diisi"),
  semester: z.enum(["GANJIL", "GENAP"]),
});
type FormValues = z.infer<typeof formSchema>;

export function AcademicYearSection({ academicYears }: { academicYears: AcademicYearItem[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { tahun: "", semester: "GANJIL" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const result = await createAcademicYear(values);
      if (!result.success) {
        toast.error(result.error ?? "Gagal menyimpan.");
        return;
      }
      toast.success("Tahun akademik ditambahkan.");
      setDialogOpen(false);
      form.reset();
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSetActive(id: string) {
    setActivatingId(id);
    startTransition(async () => {
      const result = await setActiveAcademicYear(id);
      if (!result.success) {
        toast.error(result.error ?? "Gagal mengaktifkan semester.");
      } else {
        toast.success("Semester aktif diperbarui.");
        router.refresh();
      }
      setActivatingId(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Hanya satu semester yang bisa aktif — mengaktifkan salah satu otomatis menonaktifkan yang lain.
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" /> Tambah Tahun Akademik
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Tahun Akademik</DialogTitle>
              <DialogDescription>Semester baru dibuat tidak aktif — aktifkan lewat daftar setelah dibuat.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="tahun">Tahun Akademik</Label>
                <Input id="tahun" placeholder="2026/2027" {...form.register("tahun")} />
                {form.formState.errors.tahun && (
                  <p className="text-xs text-danger">{form.formState.errors.tahun.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Semester</Label>
                <Select
                  value={form.watch("semester")}
                  onValueChange={(v) => form.setValue("semester", v as "GANJIL" | "GENAP")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GANJIL">Ganjil</SelectItem>
                    <SelectItem value="GENAP">Genap</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Menyimpan..." : "Tambah"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="divide-y divide-border">
        {academicYears.map((ay) => (
          <div key={ay.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {ay.tahun} {ay.semester === "GANJIL" ? "Ganjil" : "Genap"}
              </span>
              {ay.isActive && <Badge variant="success">Aktif</Badge>}
            </div>
            {!ay.isActive && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSetActive(ay.id)}
                disabled={activatingId === ay.id}
              >
                {activatingId === ay.id ? "Mengaktifkan..." : "Jadikan Aktif"}
              </Button>
            )}
          </div>
        ))}
        {academicYears.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Belum ada tahun akademik.</p>
        )}
      </div>
    </div>
  );
}
