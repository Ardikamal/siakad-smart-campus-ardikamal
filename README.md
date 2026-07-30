# SIAKAD Smart Campus

Sistem Informasi Akademik (SIAKAD) berbasis web untuk **Universitas Bale Bandung (UNIBBA)** — dibangun dengan Next.js 15, TypeScript, Tailwind CSS, Prisma ORM, dan MySQL.

> **Status proyek:** seluruh modul di spesifikasi awal sudah terimplementasi dan berfungsi nyata (bukan placeholder) — lihat [Status Pengerjaan](#status-pengerjaan) untuk rincian tiap fase dan catatan jujur soal keterbatasan yang ada.

## Daftar Isi

- [Status Pengerjaan](#status-pengerjaan)
- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Instalasi & Menjalankan Secara Lokal](#instalasi--menjalankan-secara-lokal)
- [Akun Demo](#akun-demo)
- [Testing](#testing)
- [Struktur Folder](#struktur-folder)
- [Keamanan](#keamanan)
- [Deployment](#deployment)
- [Dokumen Lain](#dokumen-lain)

## Status Pengerjaan

### ✅ Sudah tersedia (Fase 1 — Fondasi)

- Setup proyek Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + komponen UI bergaya shadcn (dibangun manual di atas Radix UI)
- Skema database lengkap (11 tabel) via Prisma ORM, teruji dengan data nyata di MySQL/MariaDB
- Autentikasi: JWT + HTTP-only cookie, hashing password dengan bcrypt, Role-Based Access Control (Admin & Mahasiswa)
- Proteksi rute lewat middleware + pengecekan sesi di setiap layout
- Rate limiting, validasi input (Zod), proteksi CSRF/XSS/SQL Injection dasar
- Halaman login dengan tab Admin/Mahasiswa, validasi form, animasi
- Dashboard Admin: kartu statistik, grafik mahasiswa & akademik, log aktivitas sistem — semua dari data nyata
- Dashboard Mahasiswa: IPK/IPS, ring progres SKS, jadwal hari ini, pengumuman — semua dari data nyata dan dihitung otomatis
- Dark mode / light mode, sidebar responsif (collapsible di desktop, drawer di mobile)
- Footer identitas penulis di seluruh halaman
- Seeder data (SQL mandiri + seeder Prisma) dengan data akademik yang saling terhubung secara realistis

### ✅ Sudah tersedia (Fase 2 — Kelola Mahasiswa)

- Tabel data mahasiswa: pencarian (nama/NIM), filter status akademik, sort per kolom, paginasi server-side — semua lewat URL search params (bisa di-bookmark/di-share)
- Tambah & Edit mahasiswa lewat dialog form (React Hook Form + Zod), dengan Server Actions di baliknya
- Hapus mahasiswa lewat AlertDialog konfirmasi — cascade otomatis membersihkan KRS & nilai terkait, teruji langsung di database
- Import Excel: unggah `.xlsx`, validasi per baris, laporan berapa baris berhasil/gagal beserta alasannya, plus tombol unduh template
- Export Excel & Export PDF: mengikuti filter yang sedang aktif di tabel, digenerate di server (ExcelJS & PDFKit)
- Setiap aksi (tambah/edit/hapus/import) tercatat di `activity_logs` dan muncul di Aktivitas Sistem pada dashboard admin

### ✅ Sudah tersedia (Fase 3 — Mata Kuliah & Jadwal)

- Tabel Mata Kuliah: pencarian (kode/nama/dosen), filter semester, sort per kolom, paginasi server-side; setiap baris menampilkan berapa jadwal/KRS/nilai yang memakainya sebelum dihapus
- Tambah/Edit/Hapus Mata Kuliah lewat dialog form (Server Actions) — dialog hapus menampilkan dengan jelas berapa jadwal, KRS, dan nilai yang ikut terhapus (cascade), teruji langsung di database
- Tabel Jadwal: filter per hari (urutan Senin→Sabtu, bukan alfabetis — sudah diverifikasi sesuai urutan enum di database), dropdown pemilih mata kuliah, input jam bertipe native time picker
- **Deteksi bentrok ruangan**: sistem menolak jadwal baru/edit yang bentrok ruangan+hari+jam dengan jadwal lain, dan menyebutkan mata kuliah serta jam yang bentrok — diuji dengan 3 skenario (tumpang tindih, bersebelahan/back-to-back, ruangan berbeda) langsung di database

### ✅ Sudah tersedia (Fase 4 — KRS: Ambil Mata Kuliah & Approval)

- **Sisi mahasiswa** (`/mahasiswa/krs`): ambil mata kuliah yang tersedia (dengan info jadwal/ruangan), batalkan pengajuan yang masih berstatus "Diajukan", cetak KRS sebagai PDF resmi (kop UNIBBA + kolom tanda tangan Mahasiswa/Dosen Wali/Ka. Prodi)
- **Batas maksimal SKS otomatis berdasarkan IPS semester sebelumnya** — konvensi umum kampus di Indonesia (IPS ≥ 3.5 → 24 SKS, 3.0-3.49 → 21 SKS, dst., mahasiswa baru tanpa riwayat nilai → 24 SKS). Diuji dengan data nyata: IPS 3.57 benar menghasilkan batas 24 SKS
- **Sisi admin** (`/admin/krs`): tinjau semua pengajuan KRS semester aktif, filter status & cari mahasiswa, Setujui/Tolak langsung dari tabel
- Constraint database mencegah pengajuan ganda untuk mata kuliah yang sama di semester yang sama — diuji langsung (percobaan duplikat ditolak MySQL)
- Semua aksi (ambil/batal/setuju/tolak) tercatat di log aktivitas

### ✅ Sudah tersedia (Fase 5 — Kelola Nilai, KHS & Transkrip)

- **Sisi admin** (`/admin/nilai`): pilih tahun akademik + mata kuliah, lalu input nilai untuk semua mahasiswa yang KRS-nya sudah "Disetujui" — nilai huruf & bobot terhitung otomatis dan langsung terlihat sebelum disimpan (upsert: input baru dibuat, nilai lama diperbarui, diuji langsung di database)
- **Sisi mahasiswa — KHS** (`/mahasiswa/khs`): pilih semester, lihat IPS & rincian nilai semester tersebut, cetak sebagai PDF resmi
- **Sisi mahasiswa — Nilai & Transkrip** (`/mahasiswa/nilai`): riwayat nilai seluruh semester dikelompokkan per semester, IPK keseluruhan, cetak Transkrip Akademik PDF
- Route Cetak KHS dan Cetak Transkrip berbagi satu modul PDF generator yang sama (`lib/pdf/academic-document.ts`) — konsisten dan tidak duplikasi kode

### ✅ Sudah tersedia (Fase 6 — Pengumuman, Pengaturan, Jadwal & Profil Mahasiswa)

- **Kelola Pengumuman** (`/admin/pengumuman`): tambah/edit/hapus, pencarian judul & isi
- **Pengaturan** (`/admin/pengaturan`): edit Profil Kampus (nama, alamat, telepon, email — tabel `campus_profile`, singleton), kelola Tahun Akademik dan tombol "Jadikan Aktif" — hanya satu semester yang bisa aktif dalam satu waktu, sudah diuji langsung di database bahwa transisi antar semester aktif selalu menyisakan tepat satu baris aktif
- **Jadwal Kuliah mahasiswa** (`/mahasiswa/jadwal`): jadwal mingguan (Senin–Sabtu) otomatis dari mata kuliah dengan KRS yang sudah disetujui
- **Profil mahasiswa** (`/mahasiswa/profil`): unggah foto (disimpan sebagai data URI di database — lihat catatan di bawah), ganti password (memverifikasi password lama lebih dulu)

Dengan ini seluruh modul di spesifikasi awal (`admin_module` dan `student_module`) sudah terimplementasi dan berfungsi nyata — bukan lagi placeholder.

**Catatan jujur soal foto profil:** disimpan sebagai data URI base64 langsung di kolom `TEXT`, dibatasi 2MB per file. Ini pilihan yang sengaja diambil supaya fitur upload foto tetap berfungsi sama persis di semua target deploy (termasuk Vercel/Netlify yang filesystem-nya read-only saat runtime, sehingga tidak bisa menyimpan file yang diunggah pengguna). Untuk skala pengguna yang besar, pertimbangkan pindah ke object storage (Vercel Blob, Cloudinary, S3, dst.) — kolomnya sudah `TEXT` jadi tinggal simpan URL-nya saja alih-alih data URI penuh.

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| UI Components | Komponen bergaya shadcn/ui (Radix UI primitives + CVA), Framer Motion, Lucide Icons |
| Backend | Next.js API Routes, Server Components, Server Actions-ready |
| Database | MySQL / MariaDB |
| ORM | Prisma ORM 7 (arsitektur *rust-free*, lewat `@prisma/adapter-mariadb`) |
| Autentikasi | JWT (`jose`) + HTTP-only cookie, `bcryptjs` untuk hashing password |
| Charts | Recharts |
| Import/Export | ExcelJS (baca & tulis `.xlsx`), PDFKit (generate PDF) |
| Validasi | Zod + React Hook Form |
| Testing | Vitest (unit test untuk logika akademik: skala nilai, IPK/IPS, batas SKS) |

## Prasyarat

- Node.js 20 atau lebih baru
- MySQL 8+ atau MariaDB 10.6+ (lokal, Docker, atau layanan cloud)
- npm (proyek ini memakai npm; sesuaikan perintah bila memakai pnpm/yarn)

## Instalasi & Menjalankan Secara Lokal

```bash
# 1. Masuk ke folder proyek lalu install dependency
npm install
# `postinstall` otomatis menjalankan `prisma generate`

# 2. Salin file environment lalu isi kredensial database & JWT secret
cp .env.example .env

# 3. Siapkan skema database — pilih SALAH SATU:

#    Opsi A: lewat Prisma (disarankan)
npx prisma migrate dev --name init
npm run db:seed

#    Opsi B: import langsung file SQL mandiri (schema + data sekaligus)
mysql -u root -p siakad_smart_campus < prisma/seed.sql

# 4. Jalankan development server
npm run dev
```

Buka `http://localhost:3000` — otomatis diarahkan ke halaman login.

### Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

Tempel hasilnya sebagai nilai `JWT_SECRET` di `.env`. Wajib minimal 32 karakter — aplikasi akan menolak start tanpa ini (fail-fast by design, bukan bug).

## Akun Demo

| Role | Identifier | Password |
|---|---|---|
| Administrator | `admin` (username) | `Admin@123` |
| Mahasiswa | `2312301001` (NIM) | `Mahasiswa@123` |

Ada 8 akun mahasiswa demo (NIM `2312301001`–`2312301004`, `2212301015`, `2212301016`, `2312302001`, `2312302002`) — semua memakai password yang sama, `Mahasiswa@123`. **Ganti seluruh password demo ini sebelum deploy ke production.**

## Testing

```bash
npm test
```

Unit test mencakup logika akademik yang paling berisiko kalau salah diam-diam: konversi nilai angka ke huruf/bobot di setiap batas skala, perhitungan IPK/IPS (termasuk memastikan hasilnya benar-benar dibobot per SKS, bukan rata-rata polos), dan aturan batas maksimal SKS berdasarkan IPS. Logika yang bergantung ke database (deteksi bentrok jadwal, cascade delete, dsb.) diverifikasi manual langsung ke MySQL selama pengembangan — lihat catatan di tiap bagian "Fase" di atas.

## Struktur Folder

```
siakad-smart-campus/
├── prisma/
│   ├── schema.prisma       # Skema database (11 model)
│   ├── seed.ts             # Seeder via Prisma Client
│   └── seed.sql            # Seeder SQL mandiri (schema + data, tanpa perlu Prisma CLI)
├── src/
│   ├── app/
│   │   ├── login/          # Halaman login
│   │   ├── admin/
│   │   │   ├── mahasiswa/  # Kelola Mahasiswa: page.tsx + actions.ts (Server Actions)
│   │   │   └── ...         # Route group admin lain (dilindungi middleware + layout)
│   │   ├── mahasiswa/      # Route group mahasiswa (dilindungi middleware + layout)
│   │   └── api/
│   │       ├── auth/       # Login admin/mahasiswa, logout, me
│   │       └── admin/mahasiswa/  # export (Excel/PDF), import, template
│   ├── components/
│   │   ├── ui/             # Primitif UI (button, card, tabs, dialog, select, table, dst.)
│   │   ├── layout/         # Sidebar, header, footer, theme toggle
│   │   ├── auth/           # Form & background halaman login
│   │   ├── dashboard/      # Stat card, chart, progress ring
│   │   └── admin/mahasiswa/  # Tabel, toolbar, form dialog, delete dialog, import dialog
│   ├── lib/
│   │   ├── prisma.ts       # Prisma Client singleton (driver adapter)
│   │   ├── auth.ts         # Hashing password + JWT sign/verify
│   │   ├── session.ts      # Cookie sesi
│   │   ├── academic.ts     # Konversi nilai & rumus IPK/IPS
│   │   ├── academic-options.ts  # Daftar prodi & status akademik (dipakai lintas modul)
│   │   ├── rate-limit.ts   # Rate limiter in-memory
│   │   ├── validations/    # Skema Zod per entitas
│   │   ├── queries/        # Data-access layer (dashboard, students, dst.)
│   │   └── __tests__/      # Unit test (Vitest) untuk logika akademik
│   └── middleware.ts       # Proteksi rute + RBAC
└── docs/
    ├── ERD.md
    ├── FLOWCHART.md
    └── DEPLOYMENT.md
```

## Keamanan

Diterapkan: hashing password dengan bcrypt (12 rounds), sesi JWT di cookie HTTP-only + `SameSite=Lax`, middleware RBAC di setiap rute admin/mahasiswa, validasi input dengan Zod di setiap API route, proteksi CSRF lewat pengecekan header Origin, query terparameterisasi otomatis lewat Prisma (aman dari SQL Injection), escaping otomatis dari React (aman dari XSS), rate limiting percobaan login, serta security header dasar (`X-Frame-Options`, `X-Content-Type-Options`, dll).

**Catatan jujur soal rate limiting:** limiternya berbasis memory proses Node — akurat selama app berjalan sebagai satu proses persisten (Railway, Render, VPS), tapi *tidak* cukup diandalkan sendirian di serverless (Vercel/Netlify) karena tiap invocation bisa mendarat di instance berbeda. Untuk deploy ke Vercel/Netlify, tambahkan store bersama seperti Upstash Redis — lihat [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Deployment

Panduan lengkap tiap target (Vercel, Netlify, Railway, Render) — termasuk cara menyiapkan database MySQL untuk masing-masing, karena tidak semuanya menyediakan MySQL terkelola — ada di [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Dokumen Lain

- [`docs/ERD.md`](docs/ERD.md) — Entity Relationship Diagram database
- [`docs/FLOWCHART.md`](docs/FLOWCHART.md) — Alur sistem (login, RBAC, KRS)
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Panduan deploy per platform

---

Dibuat Oleh Ardi Kamal Karima | NIM 301230023 | Kelas 6C | Program Studi S1 Teknik Informatika | Fakultas Teknologi Informasi | Universitas Bale Bandung (UNIBBA)
