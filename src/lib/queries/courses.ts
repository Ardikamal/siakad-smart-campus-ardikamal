import "server-only";
import { prisma } from "@/lib/prisma";

export interface CourseListParams {
  search?: string;
  semester?: string;
  sortBy?: "kode" | "nama" | "sks" | "semester" | "dosen";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 10;

function buildWhere(params: Pick<CourseListParams, "search" | "semester">) {
  return {
    ...(params.search
      ? {
          OR: [
            { nama: { contains: params.search } },
            { kode: { contains: params.search } },
            { dosen: { contains: params.search } },
          ],
        }
      : {}),
    ...(params.semester && params.semester !== "SEMUA" ? { semester: Number(params.semester) } : {}),
  };
}

export async function getCourseList(params: CourseListParams) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const sortBy = params.sortBy ?? "semester";
  const sortOrder = params.sortOrder ?? "asc";
  const where = buildWhere(params);

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { schedules: true, krsList: true, grades: true } } },
    }),
    prisma.course.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Dipakai oleh dropdown pemilih mata kuliah di form Jadwal (dan nanti KRS). */
export async function getAllCoursesForSelect() {
  return prisma.course.findMany({
    select: { id: true, kode: true, nama: true },
    orderBy: [{ semester: "asc" }, { nama: "asc" }],
  });
}
