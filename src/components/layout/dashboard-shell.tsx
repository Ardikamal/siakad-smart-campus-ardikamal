"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header, type NotificationItem } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { adminNav, mahasiswaNav, type NavItem } from "@/lib/nav-config";

interface DashboardShellProps {
  navType: "mahasiswa" | "admin";
  roleLabel: string;
  fullName: string;
  identifier: string;
  notifications?: NotificationItem[];
  children: React.ReactNode;
}

export function DashboardShell({
  navType,
  roleLabel,
  fullName,
  identifier,
  notifications,
  children,
}: DashboardShellProps) {
  const navItems = navType === "admin" ? adminNav : mahasiswaNav;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar
        items={navItems}
        roleLabel={roleLabel}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Header
          fullName={fullName}
          identifier={identifier}
          roleLabel={roleLabel}
          notifications={notifications}
          onMobileMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
