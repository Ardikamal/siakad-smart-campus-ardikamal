import { NextResponse, type NextRequest } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { hashPassword } from "@/lib/auth";
import { createStudentSchema } from "@/lib/validations/student";

const DEFAULT_IMPORT_PASSWORD = "Mahasiswa@123";
const MAX_REPORTED_ERRORS = 25;

interface RowError {
  row: number;
  message: string;
}

function isUniqueConstraintError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2002";
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
  }

  const workbook = new ExcelJS.Workbook();
  try {
    const arrayBuffer = await file.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);
  } catch {
    return NextResponse.json({ error: "File tidak bisa dibaca. Pastikan formatnya .xlsx." }, { status: 400 });
  }

  const sheet = workbook.worksheets[0];
  if (!sheet || sheet.rowCount < 2) {
    return NextResponse.json({ error: "Sheet kosong atau tidak ada baris data." }, { status: 400 });
  }

  const errors: RowError[] = [];
  let successCount = 0;

  const dataRows = sheet.getRows(2, sheet.rowCount - 1) ?? [];

  for (const row of dataRows) {
    const nim = String(row.getCell(1).value ?? "").trim();
    const fullName = String(row.getCell(2).value ?? "").trim();
    const prodi = String(row.getCell(3).value ?? "").trim();
    const angkatanCell = row.getCell(4).value;
    const statusRaw = String(row.getCell(5).value ?? "AKTIF").trim().toUpperCase();

    if (!nim && !fullName) continue; // baris kosong — lewati diam-diam

    const parsed = createStudentSchema.safeParse({
      nim,
      fullName,
      prodi,
      angkatan: angkatanCell,
      statusAkademik: statusRaw,
      password: DEFAULT_IMPORT_PASSWORD,
    });

    if (!parsed.success) {
      errors.push({ row: row.number, message: parsed.error.issues[0]?.message ?? "Data tidak valid" });
      continue;
    }

    try {
      const passwordHash = await hashPassword(DEFAULT_IMPORT_PASSWORD);
      const user = await prisma.user.create({ data: { role: "MAHASISWA", passwordHash } });
      await prisma.student.create({
        data: {
          userId: user.id,
          nim: parsed.data.nim,
          fullName: parsed.data.fullName,
          prodi: parsed.data.prodi,
          angkatan: parsed.data.angkatan,
          statusAkademik: parsed.data.statusAkademik,
        },
      });
      successCount++;
    } catch (err) {
      const message = isUniqueConstraintError(err) ? `NIM ${nim} sudah terdaftar` : "Gagal menyimpan ke database";
      errors.push({ row: row.number, message });
    }
  }

  if (successCount > 0) {
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "IMPORT_STUDENTS",
        description: `Import ${successCount} mahasiswa dari file Excel`,
      },
    });
  }

  return NextResponse.json({
    successCount,
    errorCount: errors.length,
    errors: errors.slice(0, MAX_REPORTED_ERRORS),
    truncated: errors.length > MAX_REPORTED_ERRORS,
  });
}
