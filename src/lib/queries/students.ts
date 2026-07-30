import "server-only";
import { prisma } from "@/lib/prisma";

export interface StudentListParams {
  search?: string;
  status?: "SEMUA" | "AKTIF" | "CUTI" | "LULUS" | "DROP_OUT";
  prodi?: string;
  sortBy?: "fullName" | "nim" | "angkatan" | "prodi";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 10;

function buildWhere(params: Pick<StudentListParams, "search" | "status" | "prodi">) {
  return {
    ...(params.search
      ? {
          OR: [{ fullName: { contains: params.search } }, { nim: { contains: params.search } }],
        }
      : {}),
    ...(params.status && params.status !== "SEMUA" ? { statusAkademik: params.status } : {}),
    ...(params.prodi && params.prodi !== "SEMUA" ? { prodi: params.prodi } : {}),
  };
}

export async function getStudentList(params: StudentListParams) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const sortBy = params.sortBy ?? "fullName";
  const sortOrder = params.sortOrder ?? "asc";
  const where = buildWhere(params);

  const [items, total] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.student.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Dipakai oleh export Excel/PDF — ambil semua baris sesuai filter, tanpa paginasi. */
export async function getAllStudentsForExport(params: Pick<StudentListParams, "search" | "status" | "prodi">) {
  return prisma.student.findMany({ where: buildWhere(params), orderBy: { fullName: "asc" } });
}
