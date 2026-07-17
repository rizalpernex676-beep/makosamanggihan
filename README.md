# Makosa - Eco-Professional Portal

Aplikasi Makosa adalah aplikasi full-stack (React/Vite + Express) yang disiapkan untuk production deployment.

## Panduan Export/Download Source Code dari AI Studio

Untuk meng-export project ini dari AI Studio ke komputer lokal atau GitHub Anda, ikuti langkah berikut:
1. Klik menu/tombol **Settings** (ikon roda gigi) atau tombol **Export** yang biasanya berada di pojok kanan atas antarmuka AI Studio.
2. Pilih opsi **Export to ZIP** untuk mengunduh seluruh source code dalam format `.zip` langsung ke komputer Anda.
3. Alternatif lain, Anda dapat memilih **Export to GitHub** jika Anda ingin langsung melakukan push source code ini ke repositori GitHub Anda.

## Persyaratan Lingkungan (Environment Variables)

Aplikasi ini membutuhkan beberapa environment variables agar dapat berjalan dengan baik. Semua secret tidak lagi di-hardcode di dalam kode. Anda **wajib** mengatur variabel-variabel berikut di hosting Anda (misal: Vercel, Railway, Render, VPS, dll) atau di file `.env` untuk local development.

Lihat file `.env.example` untuk referensi. Daftar environment variables yang dibutuhkan:

**1. API Keys & Backend Variables (Server-Side):**
* `GEMINI_API_KEY`: API Key untuk integrasi Gemini AI (jika digunakan).
* `RAJAONGKIR_API_KEY`: API Key untuk menghitung ongkos kirim.
* `APP_URL`: URL utama dari aplikasi Anda (misal: `https://makosa.com`).

**2. Firebase Configuration (Client-Side & Public):**
Semua konfigurasi Firebase harus diawali dengan `VITE_` agar dapat dibaca oleh React (Vite).
* `VITE_FIREBASE_API_KEY`
* `VITE_FIREBASE_AUTH_DOMAIN`
* `VITE_FIREBASE_PROJECT_ID`
* `VITE_FIREBASE_STORAGE_BUCKET`
* `VITE_FIREBASE_MESSAGING_SENDER_ID`
* `VITE_FIREBASE_APP_ID`
* `VITE_FIREBASE_MEASUREMENT_ID`

**3. Cloudinary Configuration (Upload Media):**
* `VITE_CLOUDINARY_CLOUD_NAME`: Cloud Name dari akun Cloudinary Anda (misal: `hr5roooz`).
* `VITE_CLOUDINARY_UPLOAD_PRESET`: Nama Unsigned Upload Preset Anda (misal: `makosa_unsigned`).

---

## Cara Menjalankan Project Secara Lokal

1. Ekstrak file ZIP yang sudah di-download, atau clone dari GitHub.
2. Buka terminal di dalam folder project.
3. Install semua dependencies:
   ```bash
   npm install
   ```
4. Copy file `.env.example` menjadi `.env` dan isi dengan konfigurasi asli Anda:
   ```bash
   cp .env.example .env
   ```
   *(Lalu edit file `.env` dan masukkan API keys yang valid)*
5. Jalankan development server:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di http://localhost:3000

---

## Cara Build untuk Production

Aplikasi ini menggunakan Express sebagai custom backend yang dibundle dengan Vite. Skrip `package.json` sudah disesuaikan agar bisa di-deploy di berbagai hosting Node.js (Render, Railway, VPS, App Engine, dll).

1. Build aplikasi:
   ```bash
   npm run build
   ```
   Proses ini akan menjalankan `vite build` (untuk frontend) dan `esbuild server.ts` (untuk backend). Hasil build akan masuk ke folder `dist/`.

2. Jalankan server production:
   ```bash
   npm start
   ```
   Atau jika secara manual:
   ```bash
   node dist/server.cjs
   ```
   Pastikan hosting Anda dikonfigurasi untuk menjalankan command `npm start` saat booting, dan mendengarkan port yang diberikan oleh environment variable hosting Anda (kode backend kami sudah otomatis mendengarkan port 3000 atau port bawaan server).
