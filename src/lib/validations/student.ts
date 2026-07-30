import { z } from "zod";
import { PRODI_OPTIONS, STATUS_AKADEMIK_OPTIONS } from "@/lib/academic-options";

const currentYear = new Date().getFullYear();

const baseStudentFields = {
  nim: z
    .string()
    .trim()
    .regex(/^\d{6,20}$/, "NIM harus berupa angka, 6-20 digit"),
  fullName: z.string().trim().min(3, "Nama lengkap minimal 3 karakter").max(150),
  prodi: z.enum(PRODI_OPTIONS),
  angkatan: z.coerce
    .number()
    .int()
    .min(2000, "Angkatan tidak valid")
    .max(currentYear, "Angkatan tidak boleh melebihi tahun berjalan"),
  statusAkademik: z.enum(STATUS_AKADEMIK_OPTIONS),
};

export const createStudentSchema = z.object({
  ...baseStudentFields,
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const updateStudentSchema = z.object({
  id: z.string().min(1),
  ...baseStudentFields,
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
