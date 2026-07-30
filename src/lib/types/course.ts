export interface CourseRecord {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  semester: number;
  dosen: string;
  _count?: {
    schedules: number;
    krsList: number;
    grades: number;
  };
}
