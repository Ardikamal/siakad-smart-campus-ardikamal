import "server-only";
import { prisma } from "@/lib/prisma";

export interface KrsAdminListParams {
  status?: "SEMUA" | "DIAJUKAN" | "DISETUJUI" | "DITOLAK";
  search?: string;
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 10;

export async function getKrsListForAdmin(params: KrsAdminListParams) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

  const activeYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
  if (!activeYear) {
    return { items: [], total: 0, page: 1, pageSize, totalPages: 1, activeYear: null };
  }

  const where = {
    academicYearId: activeYear.id,
    ...(params.status && params.status !== "SEMUA" ? { status: params.status } : {}),
    ...(params.search
      ? {
          student: {
            OR: [{ fullName: { contains: params.search } }, { nim: { contains: params.search } }],
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.krs.findMany({
      where,
      include: { student: true, course: true },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.krs.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    activeYear,
  };
}
