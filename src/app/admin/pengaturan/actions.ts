"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export interface ActionResult {
  success: boolean;
  error?: string;
}

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }
  return session;
}

const campusProfileSchema = z.object({
  id: z.string().min(1),
  namaKampus: z.string().trim().min(3, "Nama kampus wajib diisi").max(200),
  namaSingkatan: z.string().trim().min(2, "Nama singkatan wajib diisi").max(20),
  alamat: z.string().trim().min(5, "Alamat wajib diisi"),
  telepon: z.string().trim().max(30).optional().or(z.literal("")),
  email: z.string().trim().email("Format email tidak valid").optional().or(z.literal("")),
});

export async function updateCampusProfile(
  input: z.infer<typeof campusProfileSchema>
): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = campusProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const { id, ...data } = parsed.data;

  try {
    await prisma.campusProfile.update({ where: { id }, data });
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "UPDATE_CAMPUS_PROFILE",
        description: "Memperbarui profil kampus",
      },
    });
  } catch (err) {
    console.error("updateCampusProfile failed:", err);
    return { success: false, error: "Gagal menyimpan profil kampus. Coba lagi." };
  }

  revalidatePath("/admin/pengaturan");
  return { success: true };
}

const academicYearSchema = z.object({
  tahun: z
    .string()
    .trim()
    .regex(/^\d{4}\/\d{4}$/, "Format harus YYYY/YYYY, contoh 2026/2027"),
  semester: z.enum(["GANJIL", "GENAP"]),
});

export async function createAcademicYear(
  input: z.infer<typeof academicYearSchema>
): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = academicYearSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    await prisma.academicYear.create({ data: { ...parsed.data, isActive: false } });
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "CREATE_ACADEMIC_YEAR",
        description: `Menambahkan tahun akademik ${parsed.data.tahun} ${parsed.data.semester === "GANJIL" ? "Ganjil" : "Genap"}`,
      },
    });
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      return { success: false, error: "Tahun akademik dan semester ini sudah ada." };
    }
    console.error("createAcademicYear failed:", err);
    return { success: false, error: "Gagal menyimpan. Coba lagi." };
  }

  revalidatePath("/admin/pengaturan");
  return { success: true };
}

export async function setActiveAcademicYear(id: string): Promise<ActionResult> {
  const session = await requireAdmin();

  try {
    const target = await prisma.academicYear.findUnique({ where: { id } });
    if (!target) return { success: false, error: "Tahun akademik tidak ditemukan." };

    // Hanya boleh ada SATU tahun akademik aktif — matikan semua yang lain
    // dulu sebelum mengaktifkan yang dipilih, dalam satu transaksi.
    await prisma.$transaction([
      prisma.academicYear.updateMany({ where: { isActive: true }, data: { isActive: false } }),
      prisma.academicYear.update({ where: { id }, data: { isActive: true } }),
    ]);

    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "SET_ACTIVE_ACADEMIC_YEAR",
        description: `Mengaktifkan semester ${target.tahun} ${target.semester === "GANJIL" ? "Ganjil" : "Genap"}`,
      },
    });
  } catch (err) {
    console.error("setActiveAcademicYear failed:", err);
    return { success: false, error: "Gagal mengaktifkan semester. Coba lagi." };
  }

  revalidatePath("/admin/pengaturan");
  return { success: true };
}
