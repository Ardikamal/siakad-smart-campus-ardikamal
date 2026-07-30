import "server-only";
import PDFDocument from "pdfkit";
import { UNIVERSITY_NAME } from "@/lib/constants";

interface GradeRow {
  kode: string;
  nama: string;
  sks: number;
  nilaiAngka: number;
  nilaiHuruf: string;
}

interface StudentInfo {
  fullName: string;
  nim: string;
  prodi: string;
}

interface RenderGradeDocumentInput {
  title: string;
  subtitle: string;
  student: StudentInfo;
  rows: GradeRow[];
  summaryLabel: string;
  summaryValue: number;
  totalSks: number;
}

const COLUMNS = [
  { label: "No", x: 50, width: 30 },
  { label: "Kode", x: 80, width: 60 },
  { label: "Mata Kuliah", x: 140, width: 230 },
  { label: "SKS", x: 370, width: 40 },
  { label: "Nilai", x: 410, width: 40 },
  { label: "Huruf", x: 450, width: 60 },
];

function drawTableHeader(doc: PDFKit.PDFDocument, top: number): number {
  doc.rect(50, top, 495, 22).fill("#0F172A");
  doc.fontSize(9).fillColor("#FFFFFF");
  COLUMNS.forEach((col) => doc.text(col.label, col.x, top + 6, { width: col.width }));
  return top + 26;
}

/** Dipakai bersama oleh route Cetak KHS dan Cetak Transkrip — bedanya cuma data & label ringkasan. */
export function renderGradeDocumentPdf(input: RenderGradeDocumentInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(16).fillColor("#0F172A").text(input.title, { align: "center" });
    doc.fontSize(11).fillColor("#64748B").text(UNIVERSITY_NAME, { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#64748B").text(input.subtitle, { align: "center" });
    doc.moveDown(1);

    const infoTop = doc.y;
    doc.fontSize(10).fillColor("#0F172A");
    doc.text("Nama", 50, infoTop);
    doc.text(`: ${input.student.fullName}`, 150, infoTop);
    doc.text("NIM", 50, infoTop + 16);
    doc.text(`: ${input.student.nim}`, 150, infoTop + 16);
    doc.text("Program Studi", 50, infoTop + 32);
    doc.text(`: ${input.student.prodi}`, 150, infoTop + 32);

    let y = drawTableHeader(doc, infoTop + 62);

    doc.fontSize(9);
    input.rows.forEach((row, idx) => {
      if (y > 720) {
        doc.addPage({ margin: 50, size: "A4" });
        y = drawTableHeader(doc, 50);
      }
      if (idx % 2 === 0) {
        doc.rect(50, y - 3, 495, 18).fill("#F1F5F9");
      }
      doc.fillColor("#0F172A");
      doc.text(String(idx + 1), COLUMNS[0].x, y, { width: COLUMNS[0].width });
      doc.text(row.kode, COLUMNS[1].x, y, { width: COLUMNS[1].width });
      doc.text(row.nama, COLUMNS[2].x, y, { width: COLUMNS[2].width });
      doc.text(String(row.sks), COLUMNS[3].x, y, { width: COLUMNS[3].width });
      doc.text(String(row.nilaiAngka), COLUMNS[4].x, y, { width: COLUMNS[4].width });
      doc.text(row.nilaiHuruf, COLUMNS[5].x, y, { width: COLUMNS[5].width });
      y += 20;
    });

    if (input.rows.length === 0) {
      doc.fillColor("#64748B").text("Belum ada nilai untuk ditampilkan.", 50, y);
      y += 20;
    }

    doc.moveTo(50, y + 4).lineTo(545, y + 4).strokeColor("#E2E8F0").stroke();
    doc.fontSize(10).fillColor("#0F172A");
    doc.text(`Total SKS: ${input.totalSks}`, 50, y + 12);
    doc.text(`${input.summaryLabel}: ${input.summaryValue.toFixed(2)}`, 300, y + 12);

    doc.end();
  });
}
