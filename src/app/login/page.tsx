import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginBackground } from "@/components/auth/login-background";
import { LoginForm } from "@/components/auth/login-form";
import { FOOTER_TEXT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Masuk | SIAKAD Smart Campus",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <LoginBackground />

      <div className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>

      <footer className="relative z-10 px-6 py-4">
        <p className="text-center text-xs leading-relaxed text-white/40">{FOOTER_TEXT}</p>
      </footer>
    </div>
  );
}
