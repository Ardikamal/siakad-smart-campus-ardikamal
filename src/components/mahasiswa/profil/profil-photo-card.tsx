"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { updatePhoto } from "@/app/mahasiswa/profil/actions";

interface ProfilPhotoCardProps {
  fullName: string;
  currentPhotoUrl: string | null;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function ProfilPhotoCard({ fullName, currentPhotoUrl }: ProfilPhotoCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl);
  const [uploading, setUploading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUri = reader.result as string;
      setUploading(true);
      try {
        const result = await updatePhoto(dataUri);
        if (!result.success) {
          toast.error(result.error ?? "Gagal mengunggah foto.");
          return;
        }
        setPreview(dataUri);
        toast.success("Foto profil diperbarui.");
      } catch {
        toast.error("Terjadi kesalahan. Coba lagi.");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <Avatar className="h-20 w-20">
        {preview && <AvatarImage src={preview} alt={fullName} />}
        <AvatarFallback className="text-lg">{getInitials(fullName)}</AvatarFallback>
      </Avatar>
      <div>
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Camera className="h-4 w-4" /> {uploading ? "Mengunggah..." : "Ganti Foto"}
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <p className="mt-1.5 text-xs text-muted-foreground">JPG/PNG, maksimal 2MB.</p>
      </div>
    </div>
  );
}
