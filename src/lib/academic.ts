/**
 * Indonesian academic grading scale used across SIAKAD Smart Campus.
 * Kept as a single source of truth so grade input (admin) and grade
 * display (mahasiswa) never disagree on the angka -> huruf/bobot mapping.
 */
export interface GradeInfo {
  nilaiHuruf: string;
  bobot: number;
}

const SCALE: { min: number; huruf: string; bobot: number }[] = [
  { min: 85, huruf: "A", bobot: 4.0 },
  { min: 80, huruf: "AB", bobot: 3.5 },
  { min: 75, huruf: "B", bobot: 3.0 },
  { min: 70, huruf: "BC", bobot: 2.5 },
  { min: 65, huruf: "C", bobot: 2.0 },
  { min: 60, huruf: "CD", bobot: 1.5 },
  { min: 55, huruf: "D", bobot: 1.0 },
  { min: 0, huruf: "E", bobot: 0.0 },
];

export function getGradeInfo(nilaiAngka: number): GradeInfo {
  const found = SCALE.find((s) => nilaiAngka >= s.min);
  return found ? { nilaiHuruf: found.huruf, bobot: found.bobot } : { nilaiHuruf: "E", bobot: 0 };
}

export interface GradeWithCourse {
  bobot: number;
  course: { sks: number };
}

/** IPK / IPS = Σ(bobot × sks) / Σ(sks) — rumus IPK standar perguruan tinggi Indonesia. */
export function calculateGpa(grades: GradeWithCourse[]): { gpa: number; totalSks: number } {
  const totalSks = grades.reduce((sum, g) => sum + g.course.sks, 0);
  if (totalSks === 0) return { gpa: 0, totalSks: 0 };
  const totalBobot = grades.reduce((sum, g) => sum + g.bobot * g.course.sks, 0);
  return { gpa: Math.round((totalBobot / totalSks) * 100) / 100, totalSks };
}

/** SKS umumnya dibutuhkan untuk lulus S1 di Indonesia — dipakai untuk progress ring. */
export const SKS_TARGET_LULUS = 144;

/**
 * Batas maksimal SKS per semester berdasarkan IPS semester sebelumnya —
 * konvensi umum di perguruan tinggi Indonesia. `null` berarti belum ada
 * riwayat nilai (mahasiswa baru), yang diberi jatah standar 24 SKS.
 */
export function getMaxSksByIps(ips: number | null): number {
  if (ips === null) return 24;
  if (ips >= 3.5) return 24;
  if (ips >= 3.0) return 21;
  if (ips >= 2.5) return 18;
  if (ips >= 2.0) return 15;
  return 12;
}
