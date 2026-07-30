# SIAKAD Smart-Campus-Ardikamal

Sistem Informasi Akademik (SIAKAD) berbasis web untuk **Universitas Bale Bandung (UNIBBA)**. 
Aplikasi ini sebelumnya dibangun menggunakan Next.js, namun kini telah dimigrasi/dirombak menjadi versi **PHP Native** (tanpa framework) dengan antarmuka **AdminLTE / Bootstrap** sesuai dengan kebutuhan terbaru.

## Fitur Utama

Aplikasi ini mendukung tiga role pengguna utama: **Admin, Dosen, dan Mahasiswa**.

### 👨‍🎓 Fitur Mahasiswa
- **Dashboard**: Melihat kalkulasi IPK (Indeks Prestasi Kumulatif) dan total SKS yang telah diambil secara real-time.
- **Isi KRS**: Mengajukan Mata Kuliah (KRS) pada semester berjalan.
- **KHS & Transkrip**: Melihat rincian nilai mata kuliah, SKS, nilai angka, nilai huruf, dan bobot, serta rekapitulasi IPK.

### 👨‍🏫 Fitur Dosen
- **Dashboard**: Melihat jumlah mata kuliah yang sedang diajarkan.
- **Input Nilai**: Mengisi *Nilai Angka* untuk mahasiswa yang KRS-nya telah disetujui. Aplikasi akan otomatis mengonversinya menjadi *Nilai Huruf* (A, B, C, dst) dan *Bobot* (0.0 - 4.0) secara akurat.

### 👨‍💻 Fitur Admin
- **Dashboard**: Melihat statistik jumlah data Mahasiswa, Dosen, dan Mata Kuliah.
- **Data Master**: Melihat daftar Mahasiswa dan Dosen (Read-only / CRUD).
- **Approval KRS**: Melakukan validasi pengajuan KRS mahasiswa (Setujui atau Tolak).

## Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | HTML5, CSS3, JavaScript murni |
| **UI Library** | AdminLTE 3 (via CDN), Bootstrap 4 (via CDN), FontAwesome |
| **Backend** | PHP Native (tanpa framework / No Laravel / No CI) |
| **Database** | MySQL / MariaDB |
| **Koneksi DB** | PDO (PHP Data Objects) Prepared Statements (Aman dari SQL Injection) |

## Prasyarat & Instalasi

1. Pastikan Anda sudah menginstal web server lokal (seperti **XAMPP**, **Laragon**, atau LAMP/WAMP stack).
2. Pindahkan folder proyek ini (khususnya folder `php_native/`) ke dalam folder _document root_ (contoh: `htdocs` pada XAMPP atau `www` pada Laragon).
3. Buat database baru di MySQL bernama `siakad_native`.
4. Import file schema & data ke database tersebut:
   - Lokasi file SQL: `php_native/database.sql`
5. Atur koneksi database:
   - Buka file `php_native/config/database.php`
   - Sesuaikan konfigurasi `dbname`, `username`, dan `password` dengan pengaturan MySQL Anda.
6. Akses aplikasi melalui browser:
   - `http://localhost/siakad-smart-campus-ardikamal/php_native/`

## Akun Demo

Aplikasi sudah disisipkan dengan data dummy (berada di dalam file `database.sql`). Silakan gunakan akun di bawah ini untuk mencoba login:

| Role | Username | Password |
|---|---|---|
| **Admin** | `admin` | `password` |
| **Dosen** | `dosen1` | `password` |
| **Mahasiswa** | `mahasiswa1` | `password` |

## Keamanan

Sistem versi PHP Native ini mengedepankan keamanan dasar yang esensial:
- **Proteksi Sesi**: Semua halaman Admin, Dosen, dan Mahasiswa diproteksi dengan verifikasi `$_SESSION`. Pengguna tidak dapat melompati menu role lain (RBAC Sederhana).
- **Anti SQL-Injection**: Seluruh query yang melibatkan input pengguna ditulis menggunakan _Prepared Statements_ bawaan PDO PHP.
- **Enkripsi Kata Sandi**: Kata sandi dienkripsi menggunakan algoritma Hash `Bcrypt` bawaan PHP (`password_hash` dan `password_verify`).

---

Dibuat Oleh Ardi Kamal Karima | NIM 301230023 | Kelas 6C | Program Studi S1 Teknik Informatika | Fakultas Teknologi Informasi | Universitas Bale Bandung (UNIBBA)
