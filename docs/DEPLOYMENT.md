# Panduan Deployment

Empat target di brief proyek ini (Vercel, Netlify, Railway, Render) punya satu perbedaan penting yang perlu dipahami dulu:

> **Vercel, Netlify, dan Render tidak menyediakan MySQL terkelola.** Hanya **Railway** yang bisa menyediakan MySQL satu-klik di platform yang sama dengan app-nya. Untuk tiga platform lainnya, database MySQL harus dari layanan terpisah (PlanetScale, Aiven, TiDB Cloud, atau MySQL di Railway yang diakses dari luar).

Cek juga dokumentasi resmi tiap platform sebelum deploy — detail seperti free tier dan langkah UI bisa berubah.

## Opsi 1 — Railway (paling sederhana, app + database di satu tempat)

1. Buat project baru di Railway, hubungkan ke repo Git proyek ini.
2. Tambah service **MySQL** dari marketplace Railway di project yang sama.
3. Railway otomatis menyediakan variabel koneksi database (biasanya `MYSQL_URL` / `MYSQLHOST`, `MYSQLUSER`, dst.) — petakan ke `DATABASE_URL`, `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` sesuai nama yang dipakai proyek ini (lihat `.env.example`).
4. Tambahkan `JWT_SECRET` (generate seperti di README) sebagai variabel environment.
5. Set start command `npm run build && npm run start` (atau biarkan default Railway mendeteksi Next.js).
6. Setelah deploy pertama, jalankan migrasi lewat Railway Shell/CLI: `npx prisma migrate deploy` lalu `npm run db:seed` (opsional, untuk data contoh).
7. Karena Railway menjalankan app sebagai proses Node persisten (bukan serverless), rate limiter in-memory di `src/lib/rate-limit.ts` bekerja sesuai desain di sini.

## Opsi 2 — Render (app di Render, database dari luar)

1. Buat **Web Service** baru di Render, hubungkan ke repo.
2. Build command: `npm install && npm run build`. Start command: `npm run start`.
3. Karena Render tidak punya MySQL terkelola, siapkan database MySQL dari PlanetScale/Aiven/TiDB Cloud (semuanya punya free tier untuk skala tugas kuliah), lalu isi `DATABASE_URL` dan variabel diskrit lainnya sesuai kredensial yang diberikan.
4. Tambahkan `JWT_SECRET` di Environment Variables.
5. Jalankan `npx prisma migrate deploy` dari mesin lokal (mengarah ke database cloud tsb) sebelum atau setelah deploy pertama.
6. Render Web Service (paid tier) juga berjalan sebagai proses persisten, jadi rate limiter in-memory tetap akurat. Di free tier yang bisa sleep/restart, in-memory rate limit akan reset saat instance restart — bukan masalah keamanan kritis untuk tugas kuliah, tapi baik untuk diketahui.

## Opsi 3 — Vercel (serverless)

1. Import project ke Vercel dari Git.
2. Sama seperti Render, siapkan MySQL dari layanan eksternal (PlanetScale/Aiven/TiDB Cloud direkomendasikan karena didesain untuk koneksi serverless — perhatikan *connection pooling*, karena fungsi serverless bisa membuka banyak koneksi paralel).
3. Isi environment variables yang sama (`DATABASE_URL`, `DATABASE_HOST`, dst., `JWT_SECRET`) di Vercel Project Settings.
4. Vercel menjalankan tiap request sebagai fungsi serverless yang bisa mendarat di instance berbeda-beda — **rate limiter in-memory di proyek ini tidak cukup diandalkan sendirian di sini.** Untuk produksi sungguhan, ganti `src/lib/rate-limit.ts` dengan store bersama seperti Upstash Redis (`@upstash/ratelimit`), yang hanya perlu beberapa baris perubahan karena bentuk fungsi `rateLimit()` sudah dirancang mudah diganti.
5. Jalankan migrasi (`npx prisma migrate deploy`) dari lokal yang mengarah ke database production sebelum trafik pertama masuk.

## Opsi 4 — Netlify

Pola sama seperti Vercel: hosting serverless untuk Next.js, database MySQL dari layanan eksternal, dan catatan rate-limiter yang sama berlaku. Netlify mendukung Next.js App Router lewat `@netlify/plugin-nextjs` (biasanya terpasang otomatis saat mengimpor project Next.js) — tinggal set environment variables yang sama di Netlify Site Settings lalu deploy.

## Checklist sebelum production (berlaku di semua platform)

- [ ] Ganti seluruh password akun demo (lihat README) atau hapus akun demo sama sekali
- [ ] `JWT_SECRET` unik dan acak, bukan nilai dari `.env` development
- [ ] `DATABASE_URL`/kredensial database production tidak pernah di-commit ke Git
- [ ] `NODE_ENV=production` supaya cookie sesi diberi flag `Secure`
- [ ] Jalankan `npx prisma migrate deploy` (bukan `migrate dev`) di production
- [ ] Untuk deploy serverless (Vercel/Netlify): ganti rate limiter in-memory dengan store bersama
