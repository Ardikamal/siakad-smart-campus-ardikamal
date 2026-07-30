import { z } from "zod";

const courseFormFields = {
  kode: z.string().trim().min(2, "Kode wajib diisi").max(20),
  nama: z.string().trim().min(3, "Nama mata kuliah minimal 3 karakter").max(150),
  sks: z.coerce.number().int().min(1, "SKS minimal 1").max(6, "SKS maksimal 6"),
  semester: z.coerce.number().int().min(1, "Semester minimal 1").max(8, "Semester maksimal 8"),
  dosen: z.string().trim().min(3, "Nama dosen wajib diisi").max(150),
};

export const createCourseSchema = z.object(courseFormFields);
export const updateCourseSchema = z.object({ id: z.string().min(1), ...courseFormFields });

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
