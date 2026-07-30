import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getActiveAcademicYear, getStudentKrsForYear } from "@/lib/queries/krs";
import { UNIVERSITY_NAME } from "@/lib/constants";

const STATUS_LABEL: Record<string, string> = {
  DIAJUKAN: "Diajukan",
  DISETUJUI: "Disetujui",
  DITOLAK: "Ditolak",
};

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "MAHASISWA") {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  }

  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) {
    return NextResponse.json({ error: "Data mahasiswa tidak ditemukan." }, { status: 404 });
  }

  const activeYear = await getActiveAcademicYear();
  if (!activeYear) {
    return NextResponse.json({ error: "Belum ada semester aktif." }, { status: 400 });
  }

  const krsList = await getStudentKrsForYear(student.id, activeYear.id);
  const totalSks = krsList.reduce((sum, k) => sum + k.course.sks, 0);

  const buffer = await buildKrsPdf({ student, activeYear, krsList, totalSks });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="KRS-${student.nim}-${activeYear.tahun.replace("/", "-")}.pdf"`,
    },
  });
}

interface BuildKrsPdfInput {
  student: { fullName: string; nim: string; prodi: string };
  activeYear: { tahun: string; semester: string };
  krsList: Awaited<ReturnType<typeof getStudentKrsForYear>>;
  totalSks: number;
}

function buildKrsPdf({ student, activeYear, krsList, totalSks }: BuildKrsPdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const semesterLabel = activeYear.semester === "GANJIL" ? "Ganjil" : "Genap";

    doc.fontSize(16).fillColor("#0F172A").text("KARTU RENCANA STUDI (KRS)", { align: "center" });
    doc.fontSize(11).fillColor("#64748B").text(UNIVERSITY_NAME, { align: "center" });
    doc.moveDown(1.2);

    doc.fontSize(10).fillColor("#0F172A");
    const infoTop = doc.y;
    doc.text("Nama", 50, infoTop);
    doc.text(`: ${student.fullName}`, 150, infoTop);
    doc.text("NIM", 50, infoTop + 16);
    doc.text(`: ${student.nim}`, 150, infoTop + 16);
    doc.text("Program Studi", 50, infoTop + 32);
    doc.text(`: ${student.prodi}`, 150, infoTop + 32);
    doc.text("Tahun Akademik", 50, infoTop + 48);
    doc.text(`: ${activeYear.tahun} (${semesterLabel})`, 150, infoTop + 48);

    let y = infoTop + 78;
    const columns = [
      { label: "No", x: 50, width: 30 },
      { label: "Kode", x: 80, width: 60 },
      { label: "Mata Kuliah", x: 140, width: 220 },
      { label: "SKS", x: 360, width: 40 },
      { label: "Status", x: 400, width: 100 },
    ];

    doc.rect(50, y, 495, 22).fill("#0F172A");
    doc.fontSize(9).fillColor("#FFFFFF");
    columns.forEach((col) => doc.text(col.label, col.x, y + 6, { width: col.width }));
    y += 26;

    doc.fontSize(9).fillColor("#0F172A");
    krsList.forEach((k, idx) => {
      if (idx % 2 === 0) {
        doc.rect(50, y - 3, 495, 18).fill("#F1F5F9");
      }
      doc.fillColor("#0F172A");
      doc.text(String(idx + 1), columns[0].x, y, { width: columns[0].width });
      doc.text(k.course.kode, columns[1].x, y, { width: columns[1].width });
      doc.text(k.course.nama, columns[2].x, y, { width: columns[2].width });
      doc.text(String(k.course.sks), columns[3].x, y, { width: columns[3].width });
      doc.text(STATUS_LABEL[k.status] ?? k.status, columns[4].x, y, { width: columns[4].width });
      y += 20;
    });

    if (krsList.length === 0) {
      doc.fillColor("#64748B").text("Belum ada mata kuliah yang diambil semester ini.", 50, y);
      y += 24;
    }

    doc.moveTo(50, y + 4).lineTo(545, y + 4).strokeColor("#E2E8F0").stroke();
    doc.fontSize(10).fillColor("#0F172A").text(`Total SKS Diambil: ${totalSks}`, 360, y + 12);

    const signatureTop = y + 70;
    const signatureCols = [
      { label: "Mahasiswa", x: 50 },
      { label: "Dosen Wali", x: 230 },
      { label: "Ka. Program Studi", x: 400 },
    ];
    doc.fontSize(9).fillColor("#0F172A");
    signatureCols.forEach((col) => {
      doc.text("(.............................................)", col.x, signatureTop + 50, { width: 150, align: "center" });
      doc.text(col.label, col.x, signatureTop + 66, { width: 150, align: "center" });
    });

    doc.end();
  });
}
