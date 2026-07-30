/**
 * Seeder berbasis Prisma Client — jalankan dengan `npx prisma db seed`
 * (dipanggil otomatis oleh `npx prisma migrate reset`). Data yang
 * dihasilkan identik dengan prisma/seed.sql, jadi pilih SALAH SATU jalur:
 * migrate + seed ini, ATAU import seed.sql langsung. Menjalankan keduanya
 * akan gagal karena bentrok primary key / unique constraint.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding SIAKAD Smart Campus...");

  const adminPasswordHash = await bcrypt.hash("Admin@123", 12);
  const mahasiswaPasswordHash = await bcrypt.hash("Mahasiswa@123", 12);

  // ---- Admin ----------------------------------------------------------
  const adminUser = await prisma.user.create({
    data: { role: "ADMIN", passwordHash: adminPasswordHash },
  });
  await prisma.admin.create({
    data: { userId: adminUser.id, username: "admin", fullName: "Admin SIAKAD UNIBBA" },
  });

  // ---- Mahasiswa --------------------------------------------------------
  const studentsData = [
    { nim: "2312301001", fullName: "Muhammad Fajar Ramadhan", prodi: "S1 Teknik Informatika", angkatan: 2023 },
    { nim: "2312301002", fullName: "Siti Nur Aisyah", prodi: "S1 Teknik Informatika", angkatan: 2023 },
    { nim: "2312301003", fullName: "Rizky Aditya Pratama", prodi: "S1 Teknik Informatika", angkatan: 2023 },
    { nim: "2312301004", fullName: "Dewi Lestari Wulandari", prodi: "S1 Teknik Informatika", angkatan: 2023 },
    { nim: "2212301015", fullName: "Ahmad Fauzan Hidayat", prodi: "S1 Teknik Informatika", angkatan: 2022 },
    { nim: "2212301016", fullName: "Putri Handayani", prodi: "S1 Teknik Informatika", angkatan: 2022 },
    { nim: "2312302001", fullName: "Bayu Segara Nugraha", prodi: "S1 Sistem Informasi", angkatan: 2023 },
    {
      nim: "2312302002",
      fullName: "Anisa Rahma Putri",
      prodi: "S1 Sistem Informasi",
      angkatan: 2023,
      statusAkademik: "CUTI" as const,
    },
  ];

  const students = [];
  for (const s of studentsData) {
    const user = await prisma.user.create({ data: { role: "MAHASISWA", passwordHash: mahasiswaPasswordHash } });
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        nim: s.nim,
        fullName: s.fullName,
        prodi: s.prodi,
        angkatan: s.angkatan,
        statusAkademik: s.statusAkademik ?? "AKTIF",
      },
    });
    students.push(student);
  }

  // ---- Tahun akademik -----------------------------------------------
  const [ay2425Ganjil, ay2425Genap, ay2526Ganjil] = await Promise.all([
    prisma.academicYear.create({ data: { tahun: "2024/2025", semester: "GANJIL", isActive: false } }),
    prisma.academicYear.create({ data: { tahun: "2024/2025", semester: "GENAP", isActive: false } }),
    prisma.academicYear.create({ data: { tahun: "2025/2026", semester: "GANJIL", isActive: true } }),
  ]);

  // ---- Mata kuliah -----------------------------------------------------
  const coursesData = [
    { kode: "IF101", nama: "Algoritma dan Pemrograman", sks: 4, semester: 1, dosen: "Dr. Hendra Wijaya, M.Kom." },
    { kode: "IF102", nama: "Matematika Diskrit", sks: 3, semester: 1, dosen: "Rina Marlina, M.T." },
    { kode: "IF201", nama: "Struktur Data", sks: 4, semester: 2, dosen: "Dr. Hendra Wijaya, M.Kom." },
    { kode: "IF202", nama: "Basis Data", sks: 3, semester: 2, dosen: "Agus Setiawan, M.Kom." },
    { kode: "IF301", nama: "Pemrograman Web", sks: 3, semester: 3, dosen: "Fitri Ramadhani, M.T." },
    { kode: "IF302", nama: "Sistem Operasi", sks: 3, semester: 3, dosen: "Agus Setiawan, M.Kom." },
    { kode: "IF401", nama: "Jaringan Komputer", sks: 3, semester: 4, dosen: "Yusuf Maulana, M.Kom." },
    { kode: "IF402", nama: "Rekayasa Perangkat Lunak", sks: 3, semester: 4, dosen: "Fitri Ramadhani, M.T." },
    { kode: "IF501", nama: "Kriptografi", sks: 3, semester: 5, dosen: "Dr. Hendra Wijaya, M.Kom." },
    { kode: "IF502", nama: "Interaksi Manusia dan Komputer", sks: 2, semester: 5, dosen: "Rina Marlina, M.T." },
    { kode: "IF601", nama: "Kecerdasan Buatan", sks: 3, semester: 6, dosen: "Yusuf Maulana, M.Kom." },
  ];
  const courses: Record<string, Awaited<ReturnType<typeof prisma.course.create>>> = {};
  for (const c of coursesData) {
    courses[c.kode] = await prisma.course.create({ data: c });
  }

  // ---- Jadwal ------------------------------------------------------------
  await prisma.schedule.createMany({
    data: [
      { courseId: courses.IF501.id, hari: "SENIN", jamMulai: "08:00", jamSelesai: "10:30", ruangan: "Lab. Komputer 1" },
      { courseId: courses.IF502.id, hari: "SENIN", jamMulai: "13:00", jamSelesai: "14:40", ruangan: "Ruang B203" },
      { courseId: courses.IF401.id, hari: "SELASA", jamMulai: "08:00", jamSelesai: "10:30", ruangan: "Ruang B201" },
      { courseId: courses.IF402.id, hari: "RABU", jamMulai: "10:30", jamSelesai: "12:10", ruangan: "Ruang B202" },
      { courseId: courses.IF601.id, hari: "KAMIS", jamMulai: "08:00", jamSelesai: "10:30", ruangan: "Lab. Komputer 2" },
      { courseId: courses.IF301.id, hari: "JUMAT", jamMulai: "08:00", jamSelesai: "10:30", ruangan: "Lab. Komputer 1" },
    ],
  });

  // ---- KRS semester berjalan ----------------------------------------
  await prisma.krs.createMany({
    data: [
      { studentId: students[0].id, courseId: courses.IF501.id, academicYearId: ay2526Ganjil.id, status: "DISETUJUI" },
      { studentId: students[0].id, courseId: courses.IF502.id, academicYearId: ay2526Ganjil.id, status: "DISETUJUI" },
      { studentId: students[0].id, courseId: courses.IF401.id, academicYearId: ay2526Ganjil.id, status: "DIAJUKAN" },
      { studentId: students[1].id, courseId: courses.IF501.id, academicYearId: ay2526Ganjil.id, status: "DISETUJUI" },
      { studentId: students[1].id, courseId: courses.IF402.id, academicYearId: ay2526Ganjil.id, status: "DISETUJUI" },
      { studentId: students[4].id, courseId: courses.IF601.id, academicYearId: ay2526Ganjil.id, status: "DISETUJUI" },
    ],
  });

  // ---- Nilai (dipakai untuk hitung IPK) -----------------------------
  await prisma.grade.createMany({
    data: [
      { studentId: students[0].id, courseId: courses.IF101.id, academicYearId: ay2425Ganjil.id, nilaiAngka: 88, nilaiHuruf: "A", bobot: 4.0 },
      { studentId: students[0].id, courseId: courses.IF102.id, academicYearId: ay2425Ganjil.id, nilaiAngka: 76, nilaiHuruf: "B", bobot: 3.0 },
      { studentId: students[1].id, courseId: courses.IF101.id, academicYearId: ay2425Ganjil.id, nilaiAngka: 92, nilaiHuruf: "A", bobot: 4.0 },
      { studentId: students[1].id, courseId: courses.IF102.id, academicYearId: ay2425Ganjil.id, nilaiAngka: 84, nilaiHuruf: "AB", bobot: 3.5 },
      { studentId: students[2].id, courseId: courses.IF101.id, academicYearId: ay2425Ganjil.id, nilaiAngka: 71, nilaiHuruf: "BC", bobot: 2.5 },
      { studentId: students[2].id, courseId: courses.IF102.id, academicYearId: ay2425Ganjil.id, nilaiAngka: 68, nilaiHuruf: "C", bobot: 2.0 },
      { studentId: students[3].id, courseId: courses.IF101.id, academicYearId: ay2425Ganjil.id, nilaiAngka: 80, nilaiHuruf: "AB", bobot: 3.5 },
      { studentId: students[3].id, courseId: courses.IF102.id, academicYearId: ay2425Ganjil.id, nilaiAngka: 90, nilaiHuruf: "A", bobot: 4.0 },
      { studentId: students[0].id, courseId: courses.IF201.id, academicYearId: ay2425Genap.id, nilaiAngka: 85, nilaiHuruf: "A", bobot: 4.0 },
      { studentId: students[0].id, courseId: courses.IF202.id, academicYearId: ay2425Genap.id, nilaiAngka: 79, nilaiHuruf: "B", bobot: 3.0 },
      { studentId: students[1].id, courseId: courses.IF201.id, academicYearId: ay2425Genap.id, nilaiAngka: 89, nilaiHuruf: "A", bobot: 4.0 },
      { studentId: students[1].id, courseId: courses.IF202.id, academicYearId: ay2425Genap.id, nilaiAngka: 91, nilaiHuruf: "A", bobot: 4.0 },
      { studentId: students[2].id, courseId: courses.IF201.id, academicYearId: ay2425Genap.id, nilaiAngka: 73, nilaiHuruf: "BC", bobot: 2.5 },
      { studentId: students[2].id, courseId: courses.IF202.id, academicYearId: ay2425Genap.id, nilaiAngka: 65, nilaiHuruf: "C", bobot: 2.0 },
      { studentId: students[3].id, courseId: courses.IF201.id, academicYearId: ay2425Genap.id, nilaiAngka: 87, nilaiHuruf: "A", bobot: 4.0 },
      { studentId: students[3].id, courseId: courses.IF202.id, academicYearId: ay2425Genap.id, nilaiAngka: 82, nilaiHuruf: "AB", bobot: 3.5 },
      { studentId: students[4].id, courseId: courses.IF201.id, academicYearId: ay2425Genap.id, nilaiAngka: 77, nilaiHuruf: "B", bobot: 3.0 },
      { studentId: students[5].id, courseId: courses.IF202.id, academicYearId: ay2425Genap.id, nilaiAngka: 94, nilaiHuruf: "A", bobot: 4.0 },
    ],
  });

  // ---- Pengumuman ------------------------------------------------------
  await prisma.announcement.createMany({
    data: [
      {
        judul: "Jadwal Pengisian KRS Semester Ganjil 2025/2026",
        konten:
          "Pengisian KRS dibuka mulai 1 Agustus 2026 hingga 14 Agustus 2026 melalui menu KRS pada akun mahasiswa masing-masing. Pastikan berkonsultasi dengan dosen wali sebelum mengambil mata kuliah.",
      },
      {
        judul: "Libur Nasional dan Cuti Bersama",
        konten:
          "Perkuliahan diliburkan pada tanggal-tanggal libur nasional sesuai kalender akademik yang telah diterbitkan oleh Biro Akademik UNIBBA.",
      },
      {
        judul: "Batas Akhir Pengumpulan KHS Semester Genap 2024/2025",
        konten:
          "Mahasiswa diharapkan mengecek dan mencetak KHS semester genap melalui menu KHS paling lambat sebelum periode KRS semester berikutnya dibuka.",
      },
    ],
  });

  // ---- Log aktivitas contoh -------------------------------------------
  await prisma.activityLog.createMany({
    data: [
      { userId: adminUser.id, action: "LOGIN", description: "Administrator masuk ke sistem" },
      { userId: students[0].userId, action: "LOGIN", description: "Mahasiswa masuk ke sistem" },
      {
        userId: adminUser.id,
        action: "CREATE_ANNOUNCEMENT",
        description: "Menambahkan pengumuman: Jadwal Pengisian KRS Semester Ganjil 2025/2026",
      },
    ],
  });

  // ---- Profil kampus (singleton) ---------------------------------------
  await prisma.campusProfile.create({
    data: {
      namaKampus: "Universitas Bale Bandung",
      namaSingkatan: "UNIBBA",
      alamat: "Jl. R.A.A. Wiranatakusumah No. 7, Baleendah, Kabupaten Bandung, Jawa Barat 40258",
      telepon: "(022) 5940443",
      email: "rektorat@unibba.ac.id",
    },
  });

  console.log("Seeding selesai.");
  console.log("Login admin -> username: admin / password: Admin@123");
  console.log("Login mahasiswa -> NIM: 2312301001 / password: Mahasiswa@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
