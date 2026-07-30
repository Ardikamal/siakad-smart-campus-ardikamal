"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Search, Settings, User } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export interface NotificationItem {
  id: string;
  title: string;
  time: string;
}

interface HeaderProps {
  fullName: string;
  identifier: string;
  roleLabel: string;
  onMobileMenuClick: () => void;
  notifications?: NotificationItem[];
}

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function Header({ fullName, identifier, roleLabel, onMobileMenuClick, notifications = [] }: HeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/logout", { method: "POST" });
        if (!res.ok) throw new Error("logout failed");
        toast.success("Berhasil keluar dari sistem");
        router.push("/login");
        router.refresh();
      } catch {
        toast.error("Gagal keluar, silakan coba lagi.");
      }
    });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface/85 px-4 backdrop-blur-md sm:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMobileMenuClick} aria-label="Buka menu">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Cari di seluruh sistem..." className="pl-9" />
      </div>
      <div className="flex-1 sm:hidden" />

      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifikasi">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <p className="px-2.5 py-6 text-center text-sm text-muted-foreground">
                Belum ada notifikasi baru.
              </p>
            ) : (
              notifications.map((n) => (
                <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5">
                  <span className="font-medium text-foreground">{n.title}</span>
                  <span className="text-xs text-muted-foreground">{n.time}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-tight sm:block">
                <p className="text-sm font-medium text-foreground">{fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {roleLabel} · {identifier}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User /> Profil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings /> Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isPending}
              className="text-danger focus:bg-danger/10 focus:text-danger"
            >
              <LogOut /> {isPending ? "Keluar..." : "Keluar"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
