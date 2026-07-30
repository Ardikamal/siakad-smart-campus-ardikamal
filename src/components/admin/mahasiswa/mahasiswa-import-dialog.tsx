"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ImportResult {
  successCount: number;
  errorCount: number;
  errors: { row: number; message: string }[];
  truncated: boolean;
}

interface MahasiswaImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MahasiswaImportDialog({ open, onOpenChange }: MahasiswaImportDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/mahasiswa/import", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Gagal mengimpor file.");
        return;
      }

      setResult(data);
      if (data.successCount > 0) {
        toast.success(`${data.successCount} mahasiswa berhasil diimpor.`);
        router.refresh();
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) setResult(null);
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Data Mahasiswa</DialogTitle>
          <DialogDescription>
            Unggah file Excel (.xlsx) berisi data mahasiswa. Urutan kolom: NIM, Nama Lengkap, Program Studi,
            Angkatan, Status Akademik.
          </DialogDescription>
        </DialogHeader>

        <a
          href="/api/admin/mahasiswa/template"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-accent hover:underline"
        >
          <Download className="h-4 w-4" /> Unduh Template Excel
        </a>

        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/50 px-6 py-8 text-center transition-colors hover:border-accent">
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {uploading ? "Mengunggah dan memproses..." : "Klik untuk pilih file .xlsx"}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            disabled={uploading}
            onChange={handleFileChange}
          />
        </label>

        {result && (
          <div className="space-y-2 rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <Badge variant="success">{result.successCount} berhasil</Badge>
              {result.errorCount > 0 && <Badge variant="danger">{result.errorCount} gagal</Badge>}
            </div>
            {result.errors.length > 0 && (
              <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-muted-foreground">
                {result.errors.map((e, i) => (
                  <li key={i}>
                    Baris {e.row}: {e.message}
                  </li>
                ))}
              </ul>
            )}
            {result.truncated && <p className="text-xs text-muted-foreground">...dan beberapa error lainnya.</p>}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
