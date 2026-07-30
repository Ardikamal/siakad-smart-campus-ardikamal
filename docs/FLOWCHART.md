# Flowchart Sistem — SIAKAD Smart Campus

## 1. Alur Autentikasi & RBAC

```mermaid
flowchart TD
    A[Pengguna buka /login] --> B{Pilih tab}
    B -->|Mahasiswa| C[Isi NIM + Password]
    B -->|Admin| D[Isi Username + Password]
    C --> E[POST /api/auth/login/mahasiswa]
    D --> F[POST /api/auth/login/admin]

    E --> G{Origin terpercaya?}
    F --> G
    G -->|Tidak| X1[403 Ditolak]
    G -->|Ya| H{Rate limit terlampaui?}
    H -->|Ya| X2[429 Terlalu banyak percobaan]
    H -->|Tidak| I{Validasi input Zod}
    I -->|Gagal| X3[400 Data tidak valid]
    I -->|Lolos| J{User ditemukan & aktif?}
    J -->|Tidak| X4[401 Kredensial salah]
    J -->|Ya| K{Password cocok - bcrypt.compare}
    K -->|Tidak| L[Catat LOGIN_FAILED ke activity_logs]
    L --> X4
    K -->|Ya| M[Buat JWT + set cookie HttpOnly]
    M --> N[Catat LOGIN ke activity_logs]
    N --> O{Role?}
    O -->|ADMIN| P[Redirect /admin/dashboard]
    O -->|MAHASISWA| Q[Redirect /mahasiswa/dashboard]

    P --> R[[Setiap request berikutnya]]
    Q --> R
    R --> S{middleware.ts: cookie ada & JWT valid?}
    S -->|Tidak| T[Redirect /login]
    S -->|Ya| U{Role cocok dengan prefix rute?}
    U -->|Tidak| T
    U -->|Ya| V[Lanjut ke halaman]
```

## 2. Alur Pengajuan KRS (Kelola KRS — modul tahap berikutnya)

```mermaid
flowchart TD
    A[Mahasiswa buka menu KRS] --> B{Ada tahun akademik aktif?}
    B -->|Tidak| C[Tampilkan: belum ada semester aktif]
    B -->|Ya| D[Tampilkan daftar mata kuliah tersedia]
    D --> E[Mahasiswa pilih mata kuliah]
    E --> F{Total SKS + mata kuliah baru melebihi batas?}
    F -->|Ya| G[Tolak: batas SKS terlampaui]
    F -->|Tidak| H{Sudah pernah ambil di semester ini?}
    H -->|Ya| I[Tolak: constraint unik studentId+courseId+academicYearId]
    H -->|Tidak| J[Buat baris KRS, status DIAJUKAN]
    J --> K[Menunggu persetujuan Admin]
    K --> L{Admin setujui?}
    L -->|Ya| M[status -> DISETUJUI]
    L -->|Tidak| N[status -> DITOLAK]
    M --> O[Muncul di Jadwal & jadi dasar KHS semester ini]
```

## 3. Alur Perhitungan IPK / IPS (sudah aktif di Dashboard Mahasiswa)

```mermaid
flowchart LR
    A[Ambil semua baris grades milik mahasiswa] --> B[Join tiap grade ke courses untuk ambil sks]
    B --> C["totalBobot = Σ (bobot × sks)"]
    B --> D["totalSks = Σ sks"]
    C --> E["IPK = totalBobot / totalSks"]
    D --> E
    A --> F[Filter grades milik tahun akademik aktif saja]
    F --> G[Hitung ulang dengan rumus yang sama]
    G --> H[Hasil = IPS semester berjalan]
```
