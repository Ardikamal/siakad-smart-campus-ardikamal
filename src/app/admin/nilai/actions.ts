"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getGradeInfo } from "@/lib/academic";

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

const saveGradeSchema = z.object({
  studentId: z.string().min(1),
  courseId: z.string().min(1),
  academicYearId: z.string().min(1),
  nilaiAngka: z.coerce.number().min(0, "Nilai minimal 0").max(100, "Nilai maksimal 100"),
});

export async function saveGrade(input: z.infer<typeof saveGradeSchema>): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = saveGradeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const { studentId, courseId, academicYearId, nilaiAngka } = parsed.data;
  const { nilaiHuruf, bobot } = getGradeInfo(nilaiAngka);

  try {
    const [student, course] = await Promise.all([
      prisma.student.findUnique({ where: { id: studentId } }),
      prisma.course.findUnique({ where: { id: courseId } }),
    ]);

    await prisma.grade.upsert({
      where: { studentId_courseId_academicYearId: { studentId, courseId, academicYearId } },
      create: { studentId, courseId, academicYearId, nilaiAngka, nilaiHuruf, bobot },
      update: { nilaiAngka, nilaiHuruf, bobot },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "SAVE_GRADE",
        description: `Menginput nilai ${student?.fullName ?? studentId} (${student?.nim ?? "-"}) untuk "${course?.nama ?? courseId}": ${nilaiAngka} (${nilaiHuruf})`,
      },
    });
  } catch (err) {
    console.error("saveGrade failed:", err);
    return { success: false, error: "Gagal menyimpan nilai. Coba lagi." };
  }

  revalidatePath("/admin/nilai");
  return { success: true };
}
