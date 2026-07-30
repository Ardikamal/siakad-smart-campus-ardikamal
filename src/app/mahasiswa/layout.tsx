import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { mahasiswaNav } from "@/lib/nav-config";

export default async function MahasiswaLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "MAHASISWA") {
    redirect("/login");
  }

  return (
    <DashboardShell
      navType="mahasiswa"
      roleLabel="Mahasiswa"
      fullName={session.fullName}
      identifier={session.identifier}
    >
      {children}
    </DashboardShell>
  );
}
