import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getStudentAllGrades } from "@/lib/queries/grades";
import { calculateGpa } from "@/lib/academic";
import { renderGradeDocumentPdf } from "@/lib/pdf/academic-document";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "MAHASISWA") {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  }

  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) {
    return NextResponse.json({ error: "Data mahasiswa tidak ditemukan." }, { status: 404 });
  }

  const grades = await getStudentAllGrades(student.id);
  const { gpa: ipk, totalSks } = calculateGpa(grades);

  const buffer = await renderGradeDocumentPdf({
    title: "TRANSKRIP AKADEMIK",
    subtitle: "Seluruh Semester",
    student,
    rows: grades.map((g) => ({
      kode: g.course.kode,
      nama: g.course.nama,
      sks: g.course.sks,
      nilaiAngka: g.nilaiAngka,
      nilaiHuruf: g.nilaiHuruf,
    })),
    summaryLabel: "IPK",
    summaryValue: ipk,
    totalSks,
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Transkrip-${student.nim}.pdf"`,
    },
  });
}
