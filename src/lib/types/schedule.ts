export interface ScheduleRecord {
  id: string;
  courseId: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  ruangan: string;
  course: {
    id: string;
    kode: string;
    nama: string;
  };
}

export interface CourseOption {
  id: string;
  kode: string;
  nama: string;
}
