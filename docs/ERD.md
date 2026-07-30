# Entity Relationship Diagram — SIAKAD Smart Campus

Mencerminkan `prisma/schema.prisma` persis. Rendering Mermaid otomatis di GitHub, GitLab, VS Code (ekstensi Markdown Preview Mermaid), dan [Mermaid Live Editor](https://mermaid.live).

```mermaid
erDiagram
    USERS ||--o| ADMINS : "1-1"
    USERS ||--o| STUDENTS : "1-1"
    USERS ||--o{ ACTIVITY_LOGS : "mencatat"

    STUDENTS ||--o{ KRS : "mengajukan"
    STUDENTS ||--o{ GRADES : "memperoleh"

    COURSES ||--o{ KRS : "diambil lewat"
    COURSES ||--o{ GRADES : "dinilai lewat"
    COURSES ||--o{ SCHEDULES : "dijadwalkan lewat"

    ACADEMIC_YEARS ||--o{ KRS : "periode"
    ACADEMIC_YEARS ||--o{ GRADES : "periode"

    USERS {
        string id PK
        enum role "ADMIN | MAHASISWA"
        string passwordHash
        boolean isActive
        datetime lastLoginAt
        datetime createdAt
        datetime updatedAt
    }

    ADMINS {
        string id PK
        string userId FK
        string username UK
        string fullName
        string photoUrl
    }

    STUDENTS {
        string id PK
        string userId FK
        string nim UK
        string fullName
        string prodi
        int angkatan
        string photoUrl
        enum statusAkademik "AKTIF | CUTI | LULUS | DROP_OUT"
    }

    ACADEMIC_YEARS {
        string id PK
        string tahun
        enum semester "GANJIL | GENAP"
        boolean isActive
    }

    COURSES {
        string id PK
        string kode UK
        string nama
        int sks
        int semester
        string dosen
    }

    SCHEDULES {
        string id PK
        string courseId FK
        enum hari
        string jamMulai
        string jamSelesai
        string ruangan
    }

    KRS {
        string id PK
        string studentId FK
        string courseId FK
        string academicYearId FK
        enum status "DIAJUKAN | DISETUJUI | DITOLAK"
    }

    GRADES {
        string id PK
        string studentId FK
        string courseId FK
        string academicYearId FK
        float nilaiAngka
        string nilaiHuruf
        float bobot
    }

    ANNOUNCEMENTS {
        string id PK
        string judul
        string konten
    }

    CAMPUS_PROFILE {
        string id PK
        string namaKampus
        string namaSingkatan
        string alamat
        string telepon
        string email
    }

    ACTIVITY_LOGS {
        string id PK
        string userId FK
        string action
        string description
        string ipAddress
    }
```

## Catatan Desain

- **`users` terpisah dari `admins`/`students`** — tabel auth (kredensial + role) dipisah dari tabel profil, supaya logika login tidak bercampur dengan data akademik. Admin dan mahasiswa sama-sama punya baris `users`, dibedakan lewat kolom `role`.
- **`krs` dan `grades` punya unique constraint gabungan** `(studentId, courseId, academicYearId)` — mencegah satu mahasiswa mengambil/dinilai dua kali untuk mata kuliah yang sama di semester yang sama.
- **`campus_profile` adalah tabel singleton** (sengaja tidak berelasi ke tabel manapun) — hanya diisi satu baris saat seeding dan diperbarui (bukan ditambah) lewat menu Pengaturan admin.
- **`onDelete: Cascade`** dipakai di sebagian besar relasi (mis. hapus `students` otomatis hapus `krs`/`grades` terkait) kecuali `activity_logs.userId` yang `SetNull` — supaya log tetap ada meski akun penggunanya dihapus.
