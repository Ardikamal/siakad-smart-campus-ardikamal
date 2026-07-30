import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getStudentGradesForYear } from "@/lib/queries/grades";
import { calculateGpa } from "@/lib/academic";
import { renderGradeDocumentPdf } from "@/lib/pdf/academic-document";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "MAHASISWA") {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  }

  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) {
    return NextResponse.json({ error: "Data mahasiswa tidak ditemukan." }, { status: 404 });
  }

  const academicYearId = request.nextUrl.searchParams.get("academicYearId");
  if (!academicYearId) {
    return NextResponse.json({ error: "Semester tidak ditentukan." }, { status: 400 });
  }

  const academicYear = await prisma.academicYear.findUnique({ where: { id: academicYearId } });
  if (!academicYear) {
    return NextResponse.json({ error: "Semester tidak ditemukan." }, { status: 404 });
  }

  const grades = await getStudentGradesForYear(student.id, academicYearId);
  const { gpa: ips, totalSks } = calculateGpa(grades);

  const buffer = await renderGradeDocumentPdf({
    title: "KARTU HASIL STUDI (KHS)",
    subtitle: `${academicYear.tahun} ${academicYear.semester === "GANJIL" ? "Ganjil" : "Genap"}`,
    student,
    rows: grades.map((g) => ({
      kode: g.course.kode,
      nama: g.course.nama,
      sks: g.course.sks,
      nilaiAngka: g.nilaiAngka,
      nilaiHuruf: g.nilaiHuruf,
    })),
    summaryLabel: "IPS",
    summaryValue: ips,
    totalSks,
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="KHS-${student.nim}-${academicYear.tahun.replace("/", "-")}.pdf"`,
    },
  });
}
