"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, GraduationCap, Lock, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_NAME, UNIVERSITY_NAME } from "@/lib/constants";

const mahasiswaSchema = z.object({
  nim: z.string().min(1, "NIM wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});
const adminSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

type MahasiswaValues = z.infer<typeof mahasiswaSchema>;
type AdminValues = z.infer<typeof adminSchema>;

function PasswordField({
  id,
  label,
  show,
  onToggle,
  registration,
  error,
}: {
  id: string;
  label: string;
  show: boolean;
  onToggle: () => void;
  registration: UseFormRegisterReturn;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-white/80">
        {label}
      </Label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder="••••••••"
          className="border-white/15 bg-white/5 pl-10 pr-10 text-white placeholder:text-white/30 focus-visible:border-accent focus-visible:ring-accent"
          {...registration}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/70"
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}

function RememberForgotRow({
  rememberMe,
  setRememberMe,
}: {
  rememberMe: boolean;
  setRememberMe: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <label className="flex cursor-pointer items-center gap-2 text-white/70">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 rounded border-white/30 bg-white/10 accent-accent"
        />
        Ingat saya
      </label>
      <button
        type="button"
        onClick={() =>
          toast.info("Fitur reset password akan segera hadir. Hubungi admin akademik untuk bantuan.")
        }
        className="text-white/70 underline-offset-2 transition-colors hover:text-white hover:underline"
      >
        Lupa password?
      </button>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"mahasiswa" | "admin">("mahasiswa");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const mahasiswaForm = useForm<MahasiswaValues>({
    resolver: zodResolver(mahasiswaSchema),
    defaultValues: { nim: "", password: "" },
  });
  const adminForm = useForm<AdminValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: { username: "", password: "" },
  });

  async function submitLogin(endpoint: string, payload: Record<string, unknown>) {
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, rememberMe }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Login gagal. Periksa kembali data yang kamu masukkan.");
        return;
      }

      toast.success("Login berhasil, mengalihkan...");
      const redirectTarget = searchParams.get("redirect") || data.redirect || "/";
      router.push(redirectTarget);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-white/10 bg-white/[0.07] p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent shadow-lg shadow-accent/30">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-white">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-white/60">{UNIVERSITY_NAME}</p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "mahasiswa" | "admin")}>
          <TabsList className="w-full bg-white/10">
            <TabsTrigger
              value="mahasiswa"
              className="text-white/70 data-[state=active]:bg-white data-[state=active]:text-primary"
            >
              <User className="h-4 w-4" /> Mahasiswa
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              className="text-white/70 data-[state=active]:bg-white data-[state=active]:text-primary"
            >
              <ShieldCheck className="h-4 w-4" /> Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mahasiswa">
            <form
              onSubmit={mahasiswaForm.handleSubmit((values) =>
                submitLogin("/api/auth/login/mahasiswa", values)
              )}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="nim" className="text-white/80">
                  NIM
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <Input
                    id="nim"
                    placeholder="Contoh: 2312301001"
                    autoComplete="username"
                    className="border-white/15 bg-white/5 pl-10 text-white placeholder:text-white/30 focus-visible:border-accent focus-visible:ring-accent"
                    {...mahasiswaForm.register("nim")}
                  />
                </div>
                {mahasiswaForm.formState.errors.nim && (
                  <p className="text-xs text-red-300">{mahasiswaForm.formState.errors.nim.message}</p>
                )}
              </div>

              <PasswordField
                id="mhs-password"
                label="Password"
                show={showPassword}
                onToggle={() => setShowPassword((s) => !s)}
                registration={mahasiswaForm.register("password")}
                error={mahasiswaForm.formState.errors.password?.message}
              />

              <RememberForgotRow rememberMe={rememberMe} setRememberMe={setRememberMe} />

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Memproses..." : "Masuk sebagai Mahasiswa"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="admin">
            <form
              onSubmit={adminForm.handleSubmit((values) => submitLogin("/api/auth/login/admin", values))}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-white/80">
                  Username
                </Label>
                <div className="relative">
                  <ShieldCheck className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <Input
                    id="username"
                    placeholder="Username admin"
                    autoComplete="username"
                    className="border-white/15 bg-white/5 pl-10 text-white placeholder:text-white/30 focus-visible:border-accent focus-visible:ring-accent"
                    {...adminForm.register("username")}
                  />
                </div>
                {adminForm.formState.errors.username && (
                  <p className="text-xs text-red-300">{adminForm.formState.errors.username.message}</p>
                )}
              </div>

              <PasswordField
                id="admin-password"
                label="Password"
                show={showPassword}
                onToggle={() => setShowPassword((s) => !s)}
                registration={adminForm.register("password")}
                error={adminForm.formState.errors.password?.message}
              />

              <RememberForgotRow rememberMe={rememberMe} setRememberMe={setRememberMe} />

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Memproses..." : "Masuk sebagai Admin"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </motion.div>

      <p className="mt-6 text-center text-xs text-white/40">
        Butuh bantuan masuk? Hubungi Biro Akademik UNIBBA.
      </p>
    </div>
  );
}
