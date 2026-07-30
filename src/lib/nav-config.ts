import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  GraduationCap,
  CalendarDays,
  Megaphone,
  Settings,
  FileText,
  UserRound,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Data Mahasiswa", href: "/admin/mahasiswa", icon: Users },
  { label: "Mata Kuliah", href: "/admin/mata-kuliah", icon: BookOpen },
  { label: "Kelola KRS", href: "/admin/krs", icon: ClipboardList },
  { label: "Kelola Nilai", href: "/admin/nilai", icon: GraduationCap },
  { label: "Jadwal Kuliah", href: "/admin/jadwal", icon: CalendarDays },
  { label: "Pengumuman", href: "/admin/pengumuman", icon: Megaphone },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
];

export const mahasiswaNav: NavItem[] = [
  { label: "Dashboard", href: "/mahasiswa/dashboard", icon: LayoutDashboard },
  { label: "KRS", href: "/mahasiswa/krs", icon: ClipboardList },
  { label: "KHS", href: "/mahasiswa/khs", icon: FileText },
  { label: "Nilai", href: "/mahasiswa/nilai", icon: GraduationCap },
  { label: "Jadwal Kuliah", href: "/mahasiswa/jadwal", icon: CalendarDays },
  { label: "Profil", href: "/mahasiswa/profil", icon: UserRound },
];
