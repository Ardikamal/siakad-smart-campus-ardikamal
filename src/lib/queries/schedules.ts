import "server-only";
import { prisma } from "@/lib/prisma";
import type { HariOption } from "@/lib/academic-options";

export interface ScheduleListParams {
  hari?: string;
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 10;

export async function getScheduleList(params: ScheduleListParams) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

  const where = params.hari && params.hari !== "SEMUA" ? { hari: params.hari as HariOption } : {};

  const [items, total] = await Promise.all([
    prisma.schedule.findMany({
      where,
      // Enum hari diurutkan sesuai definisi di schema.prisma (Senin..Sabtu),
      // bukan alfabetis — sudah diverifikasi langsung terhadap MySQL.
      orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { course: { select: { id: true, kode: true, nama: true } } },
    }),
    prisma.schedule.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * Cek bentrok ruangan: dua jadwal bentrok jika di hari & ruangan yang sama
 * DAN rentang jamnya beririsan (start1 < end2 DAN start2 < end1).
 * `excludeId` dipakai saat edit supaya jadwal tidak dianggap bentrok dengan dirinya sendiri.
 */
export async function findConflictingSchedule(input: {
  hari: string;
  ruangan: string;
  jamMulai: string;
  jamSelesai: string;
  excludeId?: string;
}) {
  return prisma.schedule.findFirst({
    where: {
      hari: input.hari as HariOption,
      ruangan: input.ruangan,
      jamMulai: { lt: input.jamSelesai },
      jamSelesai: { gt: input.jamMulai },
      ...(input.excludeId ? { id: { not: input.excludeId } } : {}),
    },
    include: { course: { select: { nama: true } } },
  });
}
