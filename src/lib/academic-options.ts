export const PRODI_OPTIONS = ["S1 Teknik Informatika", "S1 Sistem Informasi"] as const;
export type Prodi = (typeof PRODI_OPTIONS)[number];

export const STATUS_AKADEMIK_OPTIONS = ["AKTIF", "CUTI", "LULUS", "DROP_OUT"] as const;
export type StatusAkademikOption = (typeof STATUS_AKADEMIK_OPTIONS)[number];

export const STATUS_AKADEMIK_LABEL: Record<string, string> = {
  AKTIF: "Aktif",
  CUTI: "Cuti",
  LULUS: "Lulus",
  DROP_OUT: "Drop Out",
};

export const STATUS_AKADEMIK_BADGE_VARIANT: Record<string, "success" | "warning" | "muted" | "danger"> = {
  AKTIF: "success",
  CUTI: "warning",
  LULUS: "muted",
  DROP_OUT: "danger",
};

export const SEMESTER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

// Urutan di sini SENGAJA mengikuti urutan enum HariKuliah di schema.prisma —
// MySQL ENUM mengurutkan berdasar urutan definisi, bukan alfabetis, jadi
// `ORDER BY hari ASC` di database sudah otomatis Senin -> Sabtu.
export const HARI_OPTIONS = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"] as const;
export type HariOption = (typeof HARI_OPTIONS)[number];

export const HARI_LABEL: Record<string, string> = {
  SENIN: "Senin",
  SELASA: "Selasa",
  RABU: "Rabu",
  KAMIS: "Kamis",
  JUMAT: "Jumat",
  SABTU: "Sabtu",
};
