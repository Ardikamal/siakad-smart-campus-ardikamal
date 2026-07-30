import "server-only";
import { prisma } from "@/lib/prisma";

export interface AnnouncementListParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 10;

export async function getAnnouncementList(params: AnnouncementListParams) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

  const where = params.search
    ? { OR: [{ judul: { contains: params.search } }, { konten: { contains: params.search } }] }
    : {};

  const [items, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.announcement.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
