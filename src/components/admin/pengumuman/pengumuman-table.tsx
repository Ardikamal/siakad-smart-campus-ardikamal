"use client";

import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { AnnouncementRecord } from "@/lib/types/announcement";

interface PengumumanTableProps {
  announcements: AnnouncementRecord[];
  onEdit: (announcement: AnnouncementRecord) => void;
  onDelete: (announcement: AnnouncementRecord) => void;
}

export function PengumumanTable({ announcements, onEdit, onDelete }: PengumumanTableProps) {
  if (announcements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="font-medium text-foreground">Belum ada pengumuman</p>
        <p className="text-sm text-muted-foreground">Coba ubah kata kunci pencarian, atau tambahkan pengumuman baru.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {announcements.map((a) => (
        <Card key={a.id}>
          <CardContent className="flex items-start justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="font-medium text-foreground">{a.judul}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.konten}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true, locale: localeId })}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Menu aksi">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(a)}>
                  <Pencil className="h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(a)} className="text-danger focus:bg-danger/10 focus:text-danger">
                  <Trash2 className="h-4 w-4" /> Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
