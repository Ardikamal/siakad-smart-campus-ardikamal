import { NextResponse, type NextRequest } from "next/server";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { getSession } from "@/lib/session";
import { getAllStudentsForExport, type StudentListParams } from "@/lib/queries/students";
import { STATUS_AKADEMIK_LABEL } from "@/lib/academic-options";

type StudentRow = Awaited<ReturnType<typeof getAllStudentsForExport>>[number];

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const format = searchParams.get("format") === "pdf" ? "pdf" : "excel";
  const filters: Pick<StudentListParams, "search" | "status" | "prodi"> = {
    search: searchParams.get("search") ?? undefined,
    status: (searchParams.get("status") as StudentListParams["status"]) ?? undefined,
    prodi: searchParams.get("prodi") ?? undefined,
  };

  const students = await getAllStudentsForExport(filters);
  const timestamp = Date.now();

  if (format === "pdf") {
    const buffer = await buildPdf(students);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="data-mahasiswa-${timestamp}.pdf"`,
      },
    });
  }

  const buffer = await buildExcel(students);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="data-mahasiswa-${timestamp}.xlsx"`,
    },
  });
}

async function buildExcel(students: StudentRow[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SIAKAD Smart Campus";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Data Mahasiswa");
  sheet.columns = [
    { header: "NIM", key: "nim", width: 16 },
    { header: "Nama Lengkap", key: "fullName", width: 32 },
    { header: "Program Studi", key: "prodi", width: 26 },
    { header: "Angkatan", key: "angkatan", width: 12 },
    { header: "Status Akademik", key: "status", width: 18 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };

  for (const s of students) {
    sheet.addRow({
      nim: s.nim,
      fullName: s.fullName,
      prodi: s.prodi,
      angkatan: s.angkatan,
      status: STATUS_AKADEMIK_LABEL[s.statusAkademik] ?? s.statusAkademik,
    });
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

function buildPdf(students: StudentRow[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const columns = [
      { label: "NIM", x: 40, width: 90 },
      { label: "Nama Lengkap", x: 140, width: 190 },
      { label: "Program Studi", x: 340, width: 210 },
      { label: "Angkatan", x: 560, width: 90 },
      { label: "Status", x: 660, width: 100 },
    ];

    function drawHeaderBand(pageDoc: PDFKit.PDFDocument) {
      pageDoc.fontSize(16).fillColor("#0F172A").text("Data Mahasiswa — SIAKAD Smart Campus", 40, 40, { width: 760, align: "center" });
      pageDoc.fontSize(10).fillColor("#64748B").text("Universitas Bale Bandung (UNIBBA)", 40, 62, { width: 760, align: "center" });

      const tableTop = 96;
      pageDoc.rect(40, tableTop, 720, 22).fill("#0F172A");
      pageDoc.fontSize(9).fillColor("#FFFFFF");
      columns.forEach((col) => pageDoc.text(col.label, col.x, tableTop + 6, { width: col.width }));
      return tableTop + 26;
    }

    let y = drawHeaderBand(doc);

    students.forEach((s, idx) => {
      if (y > 540) {
        doc.addPage({ margin: 40, size: "A4", layout: "landscape" });
        y = drawHeaderBand(doc);
      }
      if (idx % 2 === 0) {
        doc.rect(40, y - 3, 720, 18).fill("#F1F5F9");
      }
      doc.fontSize(9).fillColor("#0F172A");
      doc.text(s.nim, columns[0].x, y, { width: columns[0].width });
      doc.text(s.fullName, columns[1].x, y, { width: columns[1].width });
      doc.text(s.prodi, columns[2].x, y, { width: columns[2].width });
      doc.text(String(s.angkatan), columns[3].x, y, { width: columns[3].width });
      doc.text(STATUS_AKADEMIK_LABEL[s.statusAkademik] ?? s.statusAkademik, columns[4].x, y, { width: columns[4].width });
      y += 20;
    });

    if (students.length === 0) {
      doc.fontSize(10).fillColor("#64748B").text("Tidak ada data mahasiswa yang sesuai filter.", 40, y + 10);
    }

    doc.end();
  });
}
