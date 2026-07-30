"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/nav-config";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface SidebarProps {
  items: NavItem[];
  roleLabel: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

function SidebarContent({
  items,
  roleLabel,
  collapsed,
  onNavigate,
}: {
  items: NavItem[];
  roleLabel: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-primary text-primary-foreground">
      <div className={cn("flex items-center gap-3 px-5 py-6", collapsed && "justify-center px-0")}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">SIAKAD Smart Campus</p>
            <p className="truncate text-xs text-primary-foreground/60">{roleLabel}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-foreground/70 transition-colors hover:bg-white/5 hover:text-primary-foreground",
                active && "bg-white/10 text-white",
                collapsed && "justify-center px-0"
              )}
            >
              {active && (
                <motion.span
                  layoutId={`sidebar-active-${roleLabel}`}
                  className="absolute left-0 h-6 w-1 rounded-r-full bg-accent"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar({
  items,
  roleLabel,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileOpenChange,
}: SidebarProps) {
  return (
    <>
      {/* Desktop: persistent, collapsible */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 272 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative hidden shrink-0 border-r border-border md:block"
      >
        <SidebarContent items={items} roleLabel={roleLabel} collapsed={collapsed} />
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          className="absolute -right-3 top-8 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground shadow-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")} />
        </button>
      </motion.aside>

      {/* Mobile: drawer */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-72 gap-0 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu navigasi</SheetTitle>
          </SheetHeader>
          <SidebarContent items={items} roleLabel={roleLabel} collapsed={false} onNavigate={() => onMobileOpenChange(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
