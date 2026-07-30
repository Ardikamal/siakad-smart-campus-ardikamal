"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/app/mahasiswa/profil/actions";

const formSchema = z
  .object({
    currentPassword: z.string().min(1, "Wajib diisi"),
    newPassword: z.string().min(8, "Minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });
type FormValues = z.infer<typeof formSchema>;

export function ChangePasswordForm() {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const result = await changePassword(values);
      if (!result.success) {
        toast.error(result.error ?? "Gagal mengganti password.");
        return;
      }
      toast.success("Password berhasil diganti.");
      form.reset();
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">Password Saat Ini</Label>
        <Input id="currentPassword" type="password" {...form.register("currentPassword")} />
        {form.formState.errors.currentPassword && (
          <p className="text-xs text-danger">{form.formState.errors.currentPassword.message}</p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="newPassword">Password Baru</Label>
          <Input id="newPassword" type="password" {...form.register("newPassword")} />
          {form.formState.errors.newPassword && (
            <p className="text-xs text-danger">{form.formState.errors.newPassword.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
          <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} />
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-danger">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Menyimpan..." : "Ganti Password"}
      </Button>
    </form>
  );
}
