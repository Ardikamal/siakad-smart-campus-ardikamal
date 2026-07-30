export interface GradeWithCourseAndYear {
  id: string;
  nilaiAngka: number;
  nilaiHuruf: string;
  bobot: number;
  course: { id: string; kode: string; nama: string; sks: number };
  academicYear: { id: string; tahun: string; semester: string };
}

export interface GradeWithCourseOnly {
  id: string;
  nilaiAngka: number;
  nilaiHuruf: string;
  bobot: number;
  course: { id: string; kode: string; nama: string; sks: number };
}
