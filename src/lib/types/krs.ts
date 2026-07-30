export interface ScheduleSlot {
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  ruangan: string;
}

export interface KrsEntry {
  id: string;
  status: string;
  course: {
    id: string;
    kode: string;
    nama: string;
    sks: number;
    dosen: string;
    schedules: ScheduleSlot[];
  };
}

export interface AvailableCourse {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  semester: number;
  dosen: string;
  schedules: ScheduleSlot[];
}

export interface KrsAdminRow {
  id: string;
  status: string;
  createdAt: string | Date;
  student: { fullName: string; nim: string };
  course: { kode: string; nama: string; sks: number };
}
