"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/auth";

export interface ActionResult {
  success: boolean;
  error?: string;
}

async function requireMahasiswa() {
  const session = await getSession();
  if (!session || session.role !== "MAHASISWA") {
    redirect("/login");
  }
  return session;
}

// ~2MB biner mentah — base64 membengkakkan ukuran string sekitar 33%, jadi
// dicek dari panjang string data URI dibagi ~4/3 untuk mendekati ukuran asli.
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export async function updatePhoto(photoDataUri: string): Promise<ActionResult> {
  const session = await requireMahasiswa();

  if (!photoDataUri.startsWith("data:image/")) {
    return { success: false, error: "Format foto tidak valid." };
  }
  const approxBytes = (photoDataUri.length * 3) / 4;
  if (approxBytes > MAX_PHOTO_BYTES) {
    return { success: false, error: "Ukuran foto maksimal 2MB." };
  }

  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) return { success: false, error: "Data mahasiswa tidak ditemukan." };

  try {
    await prisma.student.update({ where: { id: student.id }, data: { photoUrl: photoDataUri } });
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "UPDATE_PHOTO",
        description: `${student.fullName} memperbarui foto profil`,
      },
    });
  } catch (err) {
    console.error("updatePhoto failed:", err);
    return { success: false, error: "Gagal mengunggah foto. Coba lagi." };
  }

  revalidatePath("/mahasiswa/profil");
  return { success: true };
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export async function changePassword(
  input: z.infer<typeof changePasswordSchema>
): Promise<ActionResult> {
  const session = await requireMahasiswa();

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { success: false, error: "Akun tidak ditemukan." };

  const validCurrent = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!validCurrent) {
    return { success: false, error: "Password saat ini salah." };
  }

  try {
    const newHash = await hashPassword(parsed.data.newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });
    await prisma.activityLog.create({
      data: { userId: session.userId, action: "CHANGE_PASSWORD", description: "Mahasiswa mengganti password" },
    });
  } catch (err) {
    console.error("changePassword failed:", err);
    return { success: false, error: "Gagal mengganti password. Coba lagi." };
  }

  return { success: true };
}
