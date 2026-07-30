"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCampusProfile } from "@/app/admin/pengaturan/actions";

const formSchema = z.object({
  namaKampus: z.string().min(1, "Wajib diisi"),
  namaSingkatan: z.string().min(1, "Wajib diisi"),
  alamat: z.string().min(1, "Wajib diisi"),
  telepon: z.string().optional(),
  email: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

interface CampusProfileFormProps {
  profile: {
    id: string;
    namaKampus: string;
    namaSingkatan: string;
    alamat: string;
    telepon: string | null;
    email: string | null;
  };
}

export function CampusProfileForm({ profile }: CampusProfileFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      namaKampus: profile.namaKampus,
      namaSingkatan: profile.namaSingkatan,
      alamat: profile.alamat,
      telepon: profile.telepon ?? "",
      email: profile.email ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const result = await updateCampusProfile({ id: profile.id, ...values });
      if (!result.success) {
        toast.error(result.error ?? "Gagal menyimpan.");
        return;
      }
      toast.success("Profil kampus diperbarui.");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="namaKampus">Nama Kampus</Label>
          <Input id="namaKampus" {...form.register("namaKampus")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="namaSingkatan">Singkatan</Label>
          <Input id="namaSingkatan" {...form.register("namaSingkatan")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="alamat">Alamat</Label>
        <Textarea id="alamat" rows={3} {...form.register("alamat")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="telepon">Telepon</Label>
          <Input id="telepon" {...form.register("telepon")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="text-xs text-danger">{form.formState.errors.email.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Menyimpan..." : "Simpan Profil Kampus"}
      </Button>
    </form>
  );
}
