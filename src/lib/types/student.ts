/** Bentuk data mahasiswa yang dipakai bersama oleh tabel, form, dan dialog di sisi client. */
export interface StudentRecord {
  id: string;
  nim: string;
  fullName: string;
  prodi: string;
  angkatan: number;
  statusAkademik: string;
}
