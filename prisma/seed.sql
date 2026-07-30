-- ============================================================================
-- SIAKAD SMART CAMPUS — Skema + Data Awal (Seeder)
-- Universitas Bale Bandung (UNIBBA)
--
-- File ini mandiri: bisa diimpor langsung ke MySQL/MariaDB (phpMyAdmin,
-- MySQL Workbench, atau `mysql < seed.sql`) TANPA harus lewat Prisma CLI.
-- Strukturnya sengaja dibuat identik dengan prisma/schema.prisma, jadi kalau
-- kamu memilih jalur `npx prisma migrate dev` sebagai gantinya, hasil akhirnya
-- akan sama persis.
--
-- Password demo (lihat README untuk daftar akun lengkap):
--   Admin      : Admin@123
--   Mahasiswa  : Mahasiswa@123
-- Hash di bawah adalah bcrypt asli (cost 12) dari password tsb — BUKAN hash
-- placeholder.
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS campus_profile;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS krs;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS academic_years;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- users — kredensial login untuk kedua role (admin & mahasiswa)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
  id            VARCHAR(30)  NOT NULL PRIMARY KEY,
  role          ENUM('ADMIN','MAHASISWA') NOT NULL,
  passwordHash  VARCHAR(255) NOT NULL,
  isActive      BOOLEAN      NOT NULL DEFAULT TRUE,
  lastLoginAt   DATETIME     NULL,
  createdAt     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- admins — profil administrator, 1-1 dengan users
-- ----------------------------------------------------------------------------
CREATE TABLE admins (
  id        VARCHAR(30)  NOT NULL PRIMARY KEY,
  userId    VARCHAR(30)  NOT NULL UNIQUE,
  username  VARCHAR(50)  NOT NULL UNIQUE,
  fullName  VARCHAR(150) NOT NULL,
  photoUrl  TEXT         NULL,
  createdAt DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_admins_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- students — profil mahasiswa, 1-1 dengan users
-- ----------------------------------------------------------------------------
CREATE TABLE students (
  id             VARCHAR(30)  NOT NULL PRIMARY KEY,
  userId         VARCHAR(30)  NOT NULL UNIQUE,
  nim            VARCHAR(20)  NOT NULL UNIQUE,
  fullName       VARCHAR(150) NOT NULL,
  prodi          VARCHAR(100) NOT NULL,
  angkatan       INT          NOT NULL,
  photoUrl       TEXT         NULL,
  statusAkademik ENUM('AKTIF','CUTI','LULUS','DROP_OUT') NOT NULL DEFAULT 'AKTIF',
  createdAt      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_students_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_students_prodi (prodi),
  INDEX idx_students_angkatan (angkatan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- academic_years — tahun akademik + semester aktif
-- ----------------------------------------------------------------------------
CREATE TABLE academic_years (
  id        VARCHAR(30)  NOT NULL PRIMARY KEY,
  tahun     VARCHAR(20)  NOT NULL,
  semester  ENUM('GANJIL','GENAP') NOT NULL,
  isActive  BOOLEAN      NOT NULL DEFAULT FALSE,
  createdAt DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_academic_year (tahun, semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- courses — mata kuliah
-- ----------------------------------------------------------------------------
CREATE TABLE courses (
  id        VARCHAR(30)  NOT NULL PRIMARY KEY,
  kode      VARCHAR(20)  NOT NULL UNIQUE,
  nama      VARCHAR(150) NOT NULL,
  sks       INT          NOT NULL,
  semester  INT          NOT NULL,
  dosen     VARCHAR(150) NOT NULL,
  createdAt DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- schedules — jadwal kuliah per mata kuliah
-- ----------------------------------------------------------------------------
CREATE TABLE schedules (
  id         VARCHAR(30) NOT NULL PRIMARY KEY,
  courseId   VARCHAR(30) NOT NULL,
  hari       ENUM('SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU') NOT NULL,
  jamMulai   VARCHAR(5)  NOT NULL,
  jamSelesai VARCHAR(5)  NOT NULL,
  ruangan    VARCHAR(50) NOT NULL,
  createdAt  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_schedules_course FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_schedules_hari (hari)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- krs — kartu rencana studi (pengambilan mata kuliah per semester berjalan)
-- ----------------------------------------------------------------------------
CREATE TABLE krs (
  id             VARCHAR(30) NOT NULL PRIMARY KEY,
  studentId      VARCHAR(30) NOT NULL,
  courseId       VARCHAR(30) NOT NULL,
  academicYearId VARCHAR(30) NOT NULL,
  status         ENUM('DIAJUKAN','DISETUJUI','DITOLAK') NOT NULL DEFAULT 'DIAJUKAN',
  createdAt      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_krs_student FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_krs_course FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_krs_academic_year FOREIGN KEY (academicYearId) REFERENCES academic_years(id) ON DELETE CASCADE,
  UNIQUE KEY uq_krs (studentId, courseId, academicYearId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- grades — nilai akhir per mata kuliah yang sudah selesai ditempuh
-- ----------------------------------------------------------------------------
CREATE TABLE grades (
  id             VARCHAR(30) NOT NULL PRIMARY KEY,
  studentId      VARCHAR(30) NOT NULL,
  courseId       VARCHAR(30) NOT NULL,
  academicYearId VARCHAR(30) NOT NULL,
  nilaiAngka     FLOAT       NOT NULL,
  nilaiHuruf     VARCHAR(2)  NOT NULL,
  bobot          FLOAT       NOT NULL,
  createdAt      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_grades_student FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_grades_course FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_grades_academic_year FOREIGN KEY (academicYearId) REFERENCES academic_years(id) ON DELETE CASCADE,
  UNIQUE KEY uq_grades (studentId, courseId, academicYearId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- announcements — pengumuman akademik
-- ----------------------------------------------------------------------------
CREATE TABLE announcements (
  id        VARCHAR(30) NOT NULL PRIMARY KEY,
  judul     VARCHAR(200) NOT NULL,
  konten    TEXT         NOT NULL,
  createdAt DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- activity_logs — jejak aktivitas sistem
-- ----------------------------------------------------------------------------
CREATE TABLE activity_logs (
  id          VARCHAR(30) NOT NULL PRIMARY KEY,
  userId      VARCHAR(30) NULL,
  action      VARCHAR(50) NOT NULL,
  description VARCHAR(500) NOT NULL,
  ipAddress   VARCHAR(45) NULL,
  createdAt   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_logs_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_logs_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- campus_profile — profil kampus (singleton, satu baris) untuk menu Pengaturan
-- ----------------------------------------------------------------------------
CREATE TABLE campus_profile (
  id            VARCHAR(30)  NOT NULL PRIMARY KEY,
  namaKampus    VARCHAR(200) NOT NULL,
  namaSingkatan VARCHAR(20)  NOT NULL,
  alamat        TEXT         NOT NULL,
  telepon       VARCHAR(30)  NULL,
  email         VARCHAR(100) NULL,
  updatedAt     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- SEED DATA
-- ============================================================================

-- ---- 1 akun Administrator ---------------------------------------------------
INSERT INTO users (id, role, passwordHash, isActive) VALUES
('usr_admin01', 'ADMIN', '$2b$12$vTqnUg6StaMLcqEcmf1fAeE2nvXCshQ.wofqdm8KxyA4c6wUc38vG', TRUE);

INSERT INTO admins (id, userId, username, fullName) VALUES
('adm_0001', 'usr_admin01', 'admin', 'Admin SIAKAD UNIBBA');

-- ---- 8 akun Mahasiswa -------------------------------------------------------
INSERT INTO users (id, role, passwordHash, isActive) VALUES
('usr_std0001', 'MAHASISWA', '$2b$12$oDSTCwVEldsSi0J4mRGDGuKxJ9azqOnDjlMDMPSswa3UuobFNWcGy', TRUE),
('usr_std0002', 'MAHASISWA', '$2b$12$oDSTCwVEldsSi0J4mRGDGuKxJ9azqOnDjlMDMPSswa3UuobFNWcGy', TRUE),
('usr_std0003', 'MAHASISWA', '$2b$12$oDSTCwVEldsSi0J4mRGDGuKxJ9azqOnDjlMDMPSswa3UuobFNWcGy', TRUE),
('usr_std0004', 'MAHASISWA', '$2b$12$oDSTCwVEldsSi0J4mRGDGuKxJ9azqOnDjlMDMPSswa3UuobFNWcGy', TRUE),
('usr_std0005', 'MAHASISWA', '$2b$12$oDSTCwVEldsSi0J4mRGDGuKxJ9azqOnDjlMDMPSswa3UuobFNWcGy', TRUE),
('usr_std0006', 'MAHASISWA', '$2b$12$oDSTCwVEldsSi0J4mRGDGuKxJ9azqOnDjlMDMPSswa3UuobFNWcGy', TRUE),
('usr_std0007', 'MAHASISWA', '$2b$12$oDSTCwVEldsSi0J4mRGDGuKxJ9azqOnDjlMDMPSswa3UuobFNWcGy', TRUE),
('usr_std0008', 'MAHASISWA', '$2b$12$oDSTCwVEldsSi0J4mRGDGuKxJ9azqOnDjlMDMPSswa3UuobFNWcGy', TRUE);

INSERT INTO students (id, userId, nim, fullName, prodi, angkatan, statusAkademik) VALUES
('std_0001', 'usr_std0001', '2312301001', 'Muhammad Fajar Ramadhan', 'S1 Teknik Informatika', 2023, 'AKTIF'),
('std_0002', 'usr_std0002', '2312301002', 'Siti Nur Aisyah',        'S1 Teknik Informatika', 2023, 'AKTIF'),
('std_0003', 'usr_std0003', '2312301003', 'Rizky Aditya Pratama',   'S1 Teknik Informatika', 2023, 'AKTIF'),
('std_0004', 'usr_std0004', '2312301004', 'Dewi Lestari Wulandari', 'S1 Teknik Informatika', 2023, 'AKTIF'),
('std_0005', 'usr_std0005', '2212301015', 'Ahmad Fauzan Hidayat',   'S1 Teknik Informatika', 2022, 'AKTIF'),
('std_0006', 'usr_std0006', '2212301016', 'Putri Handayani',        'S1 Teknik Informatika', 2022, 'AKTIF'),
('std_0007', 'usr_std0007', '2312302001', 'Bayu Segara Nugraha',    'S1 Sistem Informasi',   2023, 'AKTIF'),
('std_0008', 'usr_std0008', '2312302002', 'Anisa Rahma Putri',      'S1 Sistem Informasi',   2023, 'CUTI');

-- ---- Tahun akademik ----------------------------------------------------------
INSERT INTO academic_years (id, tahun, semester, isActive) VALUES
('ay_202425ganjil', '2024/2025', 'GANJIL', FALSE),
('ay_202425genap',  '2024/2025', 'GENAP',  FALSE),
('ay_202526ganjil', '2025/2026', 'GANJIL', TRUE);

-- ---- Mata kuliah ---------------------------------------------------------
INSERT INTO courses (id, kode, nama, sks, semester, dosen) VALUES
('crs_01', 'IF101', 'Algoritma dan Pemrograman',        4, 1, 'Dr. Hendra Wijaya, M.Kom.'),
('crs_02', 'IF102', 'Matematika Diskrit',                3, 1, 'Rina Marlina, M.T.'),
('crs_03', 'IF201', 'Struktur Data',                     4, 2, 'Dr. Hendra Wijaya, M.Kom.'),
('crs_04', 'IF202', 'Basis Data',                        3, 2, 'Agus Setiawan, M.Kom.'),
('crs_05', 'IF301', 'Pemrograman Web',                   3, 3, 'Fitri Ramadhani, M.T.'),
('crs_06', 'IF302', 'Sistem Operasi',                    3, 3, 'Agus Setiawan, M.Kom.'),
('crs_07', 'IF401', 'Jaringan Komputer',                 3, 4, 'Yusuf Maulana, M.Kom.'),
('crs_08', 'IF402', 'Rekayasa Perangkat Lunak',          3, 4, 'Fitri Ramadhani, M.T.'),
('crs_09', 'IF501', 'Kriptografi',                       3, 5, 'Dr. Hendra Wijaya, M.Kom.'),
('crs_10', 'IF502', 'Interaksi Manusia dan Komputer',    2, 5, 'Rina Marlina, M.T.'),
('crs_11', 'IF601', 'Kecerdasan Buatan',                 3, 6, 'Yusuf Maulana, M.Kom.');

-- ---- Jadwal kuliah -------------------------------------------------------
INSERT INTO schedules (id, courseId, hari, jamMulai, jamSelesai, ruangan) VALUES
('sch_01', 'crs_09', 'SENIN',  '08:00', '10:30', 'Lab. Komputer 1'),
('sch_02', 'crs_10', 'SENIN',  '13:00', '14:40', 'Ruang B203'),
('sch_03', 'crs_07', 'SELASA', '08:00', '10:30', 'Ruang B201'),
('sch_04', 'crs_08', 'RABU',   '10:30', '12:10', 'Ruang B202'),
('sch_05', 'crs_11', 'KAMIS',  '08:00', '10:30', 'Lab. Komputer 2'),
('sch_06', 'crs_05', 'JUMAT',  '08:00', '10:30', 'Lab. Komputer 1');

-- ---- KRS semester berjalan (2025/2026 Ganjil) -----------------------------
INSERT INTO krs (id, studentId, courseId, academicYearId, status) VALUES
('krs_0001', 'std_0001', 'crs_09', 'ay_202526ganjil', 'DISETUJUI'),
('krs_0002', 'std_0001', 'crs_10', 'ay_202526ganjil', 'DISETUJUI'),
('krs_0003', 'std_0001', 'crs_07', 'ay_202526ganjil', 'DIAJUKAN'),
('krs_0004', 'std_0002', 'crs_09', 'ay_202526ganjil', 'DISETUJUI'),
('krs_0005', 'std_0002', 'crs_08', 'ay_202526ganjil', 'DISETUJUI'),
('krs_0006', 'std_0005', 'crs_11', 'ay_202526ganjil', 'DISETUJUI');

-- ---- Nilai semester lalu (dipakai untuk hitung IPK) ------------------------
-- 2024/2025 Ganjil
INSERT INTO grades (id, studentId, courseId, academicYearId, nilaiAngka, nilaiHuruf, bobot) VALUES
('grd_0001', 'std_0001', 'crs_01', 'ay_202425ganjil', 88, 'A',  4.0),
('grd_0002', 'std_0001', 'crs_02', 'ay_202425ganjil', 76, 'B',  3.0),
('grd_0003', 'std_0002', 'crs_01', 'ay_202425ganjil', 92, 'A',  4.0),
('grd_0004', 'std_0002', 'crs_02', 'ay_202425ganjil', 84, 'AB', 3.5),
('grd_0005', 'std_0003', 'crs_01', 'ay_202425ganjil', 71, 'BC', 2.5),
('grd_0006', 'std_0003', 'crs_02', 'ay_202425ganjil', 68, 'C',  2.0),
('grd_0007', 'std_0004', 'crs_01', 'ay_202425ganjil', 80, 'AB', 3.5),
('grd_0008', 'std_0004', 'crs_02', 'ay_202425ganjil', 90, 'A',  4.0);

-- 2024/2025 Genap
INSERT INTO grades (id, studentId, courseId, academicYearId, nilaiAngka, nilaiHuruf, bobot) VALUES
('grd_0009', 'std_0001', 'crs_03', 'ay_202425genap', 85, 'A',  4.0),
('grd_0010', 'std_0001', 'crs_04', 'ay_202425genap', 79, 'B',  3.0),
('grd_0011', 'std_0002', 'crs_03', 'ay_202425genap', 89, 'A',  4.0),
('grd_0012', 'std_0002', 'crs_04', 'ay_202425genap', 91, 'A',  4.0),
('grd_0013', 'std_0003', 'crs_03', 'ay_202425genap', 73, 'BC', 2.5),
('grd_0014', 'std_0003', 'crs_04', 'ay_202425genap', 65, 'C',  2.0),
('grd_0015', 'std_0004', 'crs_03', 'ay_202425genap', 87, 'A',  4.0),
('grd_0016', 'std_0004', 'crs_04', 'ay_202425genap', 82, 'AB', 3.5),
('grd_0017', 'std_0005', 'crs_03', 'ay_202425genap', 77, 'B',  3.0),
('grd_0018', 'std_0006', 'crs_04', 'ay_202425genap', 94, 'A',  4.0);

-- ---- Pengumuman -------------------------------------------------------------
INSERT INTO announcements (id, judul, konten) VALUES
('anc_0001', 'Jadwal Pengisian KRS Semester Ganjil 2025/2026',
 'Pengisian KRS dibuka mulai 1 Agustus 2026 hingga 14 Agustus 2026 melalui menu KRS pada akun mahasiswa masing-masing. Pastikan berkonsultasi dengan dosen wali sebelum mengambil mata kuliah.'),
('anc_0002', 'Libur Nasional dan Cuti Bersama',
 'Perkuliahan diliburkan pada tanggal-tanggal libur nasional sesuai kalender akademik yang telah diterbitkan oleh Biro Akademik UNIBBA.'),
('anc_0003', 'Batas Akhir Pengumpulan KHS Semester Genap 2024/2025',
 'Mahasiswa diharapkan mengecek dan mencetak KHS semester genap melalui menu KHS paling lambat sebelum periode KRS semester berikutnya dibuka.');

-- ---- Log aktivitas contoh ----------------------------------------------------
INSERT INTO activity_logs (id, userId, action, description) VALUES
('log_0001', 'usr_admin01', 'LOGIN', 'Administrator masuk ke sistem'),
('log_0002', 'usr_std0001', 'LOGIN', 'Mahasiswa masuk ke sistem'),
('log_0003', 'usr_admin01', 'CREATE_ANNOUNCEMENT', 'Menambahkan pengumuman: Jadwal Pengisian KRS Semester Ganjil 2025/2026');

-- ---- Profil kampus (singleton) ------------------------------------------------
INSERT INTO campus_profile (id, namaKampus, namaSingkatan, alamat, telepon, email) VALUES
('campus_01', 'Universitas Bale Bandung', 'UNIBBA',
 'Jl. R.A.A. Wiranatakusumah No. 7, Baleendah, Kabupaten Bandung, Jawa Barat 40258',
 '(022) 5940443', 'rektorat@unibba.ac.id');
