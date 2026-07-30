import { z } from "zod";
import { HARI_OPTIONS } from "@/lib/academic-options";

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const scheduleFormFields = {
  courseId: z.string().min(1, "Pilih mata kuliah"),
  hari: z.enum(HARI_OPTIONS),
  jamMulai: z.string().regex(TIME_REGEX, "Format jam harus HH:MM"),
  jamSelesai: z.string().regex(TIME_REGEX, "Format jam harus HH:MM"),
  ruangan: z.string().trim().min(1, "Ruangan wajib diisi").max(50),
};

export const createScheduleSchema = z
  .object(scheduleFormFields)
  .refine((data) => data.jamMulai < data.jamSelesai, {
    message: "Jam mulai harus sebelum jam selesai",
    path: ["jamSelesai"],
  });

export const updateScheduleSchema = z
  .object({ id: z.string().min(1), ...scheduleFormFields })
  .refine((data) => data.jamMulai < data.jamSelesai, {
    message: "Jam mulai harus sebelum jam selesai",
    path: ["jamSelesai"],
  });

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
