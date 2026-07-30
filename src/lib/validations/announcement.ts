import { z } from "zod";

const announcementFields = {
  judul: z.string().trim().min(5, "Judul minimal 5 karakter").max(200),
  konten: z.string().trim().min(10, "Konten minimal 10 karakter"),
};

export const createAnnouncementSchema = z.object(announcementFields);
export const updateAnnouncementSchema = z.object({ id: z.string().min(1), ...announcementFields });

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
