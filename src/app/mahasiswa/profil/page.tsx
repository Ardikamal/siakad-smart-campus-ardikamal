import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProfilPhotoCard } from "@/components/mahasiswa/profil/profil-photo-card";
import { ChangePasswordForm } from "@/components/mahasiswa/profil/change-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_AKADEMIK_LABEL } from "@/lib/academic-options";

export default async function ProfilPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">Profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">Kelola foto profil dan keamanan akun kamu.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Akademik</CardTitle>
          <CardDescription>Data ini dikelola oleh admin akademik dan tidak bisa diubah sendiri.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProfilPhotoCard fullName={student.fullName} currentPhotoUrl={student.photoUrl} />
          <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Nama Lengkap</p>
              <p className="text-sm font-medium text-foreground">{student.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">NIM</p>
              <p className="font-mono text-sm font-medium text-foreground">{student.nim}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Program Studi</p>
              <p className="text-sm font-medium text-foreground">{student.prodi}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Angkatan</p>
              <p className="text-sm font-medium text-foreground">{student.angkatan}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status Akademik</p>
              <p className="text-sm font-medium text-foreground">{STATUS_AKADEMIK_LABEL[student.statusAkademik]}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ganti Password</CardTitle>
          <CardDescription>Gunakan password yang kuat dan tidak dipakai di layanan lain.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
