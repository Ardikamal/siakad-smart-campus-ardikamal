import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNav } from "@/lib/nav-config";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Defense in depth: middleware already guards this route group, but a
  // Server Component check here means the dashboard never even starts
  // rendering for an unauthenticated request, regardless of middleware config.
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <DashboardShell
      navType="admin"
      roleLabel="Administrator"
      fullName={session.fullName}
      identifier={session.identifier}
    >
      {children}
    </DashboardShell>
  );
}
