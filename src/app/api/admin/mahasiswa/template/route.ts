import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Template");
  sheet.columns = [
    { header: "NIM", key: "nim", width: 16 },
    { header: "Nama Lengkap", key: "fullName", width: 32 },
    { header: "Program Studi", key: "prodi", width: 26 },
    { header: "Angkatan", key: "angkatan", width: 12 },
    { header: "Status Akademik (AKTIF/CUTI/LULUS/DROP_OUT)", key: "status", width: 38 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };

  sheet.addRow({
    nim: "2312301099",
    fullName: "Contoh Nama Mahasiswa",
    prodi: "S1 Teknik Informatika",
    angkatan: 2023,
    status: "AKTIF",
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(new Uint8Array(Buffer.from(arrayBuffer)), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="template-import-mahasiswa.xlsx"',
    },
  });
}
