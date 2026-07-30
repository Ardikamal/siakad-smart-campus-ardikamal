"use client";

import { useState, useTransition } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { addKrs, cancelKrs } from "@/app/mahasiswa/krs/actions";
import { HARI_LABEL } from "@/lib/academic-options";
import type { AvailableCourse, KrsEntry, ScheduleSlot } from "@/lib/types/krs";

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger"> = {
  DIAJUKAN: "warning",
  DISETUJUI: "success",
  DITOLAK: "danger",
};
const STATUS_LABEL: Record<string, string> = {
  DIAJUKAN: "Diajukan",
  DISETUJUI: "Disetujui",
  DITOLAK: "Ditolak",
};

function ScheduleLine({ schedules }: { schedules: ScheduleSlot[] }) {
  if (schedules.length === 0) {
    return <span className="text-xs text-muted-foreground">Jadwal belum tersedia</span>;
  }
  return (
    <span className="text-xs text-muted-foreground">
      {schedules
        .map((s) => `${HARI_LABEL[s.hari] ?? s.hari} ${s.jamMulai}-${s.jamSelesai} · ${s.ruangan}`)
        .join(", ")}
    </span>
  );
}

interface KrsPageClientProps {
  currentKrs: KrsEntry[];
  availableCourses: AvailableCourse[];
  currentSks: number;
  maxSks: number;
  lastIps: number | null;
}

export function KrsPageClient({ currentKrs, availableCourses, currentSks, maxSks, lastIps }: KrsPageClientProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleAdd(courseId: string) {
    setPendingId(courseId);
    startTransition(async () => {
      const result = await addKrs(courseId);
      if (!result.success) {
        toast.error(result.error ?? "Gagal menambahkan mata kuliah.");
      } else {
        toast.success("Mata kuliah ditambahkan ke KRS.");
      }
      setPendingId(null);
    });
  }

  function handleCancel(krsId: string) {
    setPendingId(krsId);
    startTransition(async () => {
      const result = await cancelKrs(krsId);
      if (!result.success) {
        toast.error(result.error ?? "Gagal membatalkan.");
      } else {
        toast.success("Pengajuan KRS dibatalkan.");
      }
      setPendingId(null);
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">SKS Diambil</p>
            <p className="font-serif text-2xl font-semibold text-foreground">
              {currentSks} <span className="text-base font-normal text-muted-foreground">/ {maxSks}</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Sisa SKS Bisa Diambil</p>
            <p className="font-serif text-2xl font-semibold text-foreground">{Math.max(0, maxSks - currentSks)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">IPS Acuan Batas SKS</p>
            <p className="font-serif text-2xl font-semibold text-foreground">
              {lastIps !== null ? lastIps.toFixed(2) : "Mahasiswa Baru"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Mata Kuliah Diambil</CardTitle>
            <CardDescription>Daftar mata kuliah dalam KRS semester ini</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/api/mahasiswa/krs/cetak">
              <Download className="h-4 w-4" /> Cetak KRS
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          {currentKrs.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Belum ada mata kuliah yang diambil.</p>
          ) : (
            <div className="divide-y divide-border">
              {currentKrs.map((k) => (
                <div
                  key={k.id}
                  className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {k.course.nama} <span className="font-mono text-xs text-muted-foreground">({k.course.kode})</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {k.course.sks} SKS · {k.course.dosen}
                    </p>
                    <ScheduleLine schedules={k.course.schedules} />
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={STATUS_VARIANT[k.status]}>{STATUS_LABEL[k.status]}</Badge>
                    {k.status === "DIAJUKAN" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(k.id)}
                        disabled={pendingId === k.id}
                        className="text-danger hover:bg-danger/10 hover:text-danger"
                      >
                        Batalkan
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Mata Kuliah</CardTitle>
          <CardDescription>Mata kuliah yang tersedia dan belum kamu ambil semester ini</CardDescription>
        </CardHeader>
        <CardContent>
          {availableCourses.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Tidak ada mata kuliah tersedia lagi.</p>
          ) : (
            <div className="divide-y divide-border">
              {availableCourses.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {c.nama} <span className="font-mono text-xs text-muted-foreground">({c.kode})</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Semester {c.semester} · {c.sks} SKS · {c.dosen}
                    </p>
                    <ScheduleLine schedules={c.schedules} />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAdd(c.id)}
                    disabled={pendingId === c.id || currentSks + c.sks > maxSks}
                  >
                    {pendingId === c.id ? "Menambahkan..." : "+ Ambil"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
