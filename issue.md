# 📋 Issue: Setup Backend — Aplikasi Pencatatan Keuangan Bisnis Tiket & Hotel

## Overview

Membangun backend REST API untuk aplikasi pencatatan keuangan bisnis tiket pesawat & hotel menggunakan stack berikut:

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Elysia.js](https://elysiajs.com/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: MySQL

---

## ✅ Task Checklist

### Phase 1 — Project Initialization

- [ ] **1.1** Inisialisasi project baru dengan `bun init`
- [ ] **1.2** Install dependencies utama:
  - `elysia` — web framework
  - `drizzle-orm` dan `mysql2` — ORM dan driver database
  - `@elysiajs/cookie` atau plugin session yang sesuai — untuk manajemen session
- [ ] **1.3** Install dev dependencies:
  - `drizzle-kit` — untuk migration dan generate schema
  - `bun-types`
- [ ] **1.4** Buat struktur folder project:
  ```
  src/
  ├── db/
  │   ├── schema.ts       # Definisi semua tabel
  │   └── index.ts        # Koneksi database
  ├── modules/
  │   ├── auth/
  │   │   ├── auth.routes.ts
  │   │   └── auth.service.ts
  │   └── transactions/
  │       ├── transactions.routes.ts
  │       └── transactions.service.ts
  ├── middleware/
  │   └── auth.middleware.ts
  └── index.ts            # Entry point
  drizzle.config.ts
  .env
  ```
- [ ] **1.5** Buat file `.env` dengan variabel: `DATABASE_URL`, `JWT_SECRET` (atau `SESSION_SECRET`)

---

### Phase 2 — Database Schema

- [ ] **2.1** Definisikan tabel **`users`** di `src/db/schema.ts` dengan kolom:
  - `id` (primary key, auto increment)
  - `name` (string)
  - `email` (string, unique)
  - `password` (string, hashed)
  - `created_at` (timestamp)

- [ ] **2.2** Definisikan tabel **`sessions`** dengan kolom:
  - `id` (primary key, string/uuid)
  - `user_id` (foreign key → users.id)
  - `expires_at` (timestamp)
  - `created_at` (timestamp)

- [ ] **2.3** Definisikan tabel **`transactions`** dengan kolom:
  - `id` (primary key, auto increment)
  - `user_id` (foreign key → users.id) — pencatat transaksi
  - `tanggal` (date)
  - `jenis_produk` (enum: `'tiket_pesawat'` | `'hotel'`)
  - `nama_pelanggan` (string)
  - `kode_booking` (string)
  - `harga_modal` (decimal)
  - `harga_jual` (decimal)
  - `margin` (decimal) — bisa dihitung otomatis: `harga_jual - harga_modal`
  - `status_bayar` (enum: `'lunas'` | `'belum_lunas'` | `'dp'`)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

- [ ] **2.4** Setup `drizzle.config.ts` agar `drizzle-kit` tahu lokasi schema dan koneksi DB
- [ ] **2.5** Jalankan `bunx drizzle-kit generate` untuk generate file migration
- [ ] **2.6** Jalankan `bunx drizzle-kit migrate` untuk menerapkan migration ke database MySQL

---

### Phase 3 — Database Connection

- [ ] **3.1** Di `src/db/index.ts`, buat koneksi MySQL menggunakan `drizzle(mysql2(...))` yang membaca `DATABASE_URL` dari `.env`
- [ ] **3.2** Ekspor instance `db` untuk digunakan di seluruh aplikasi

---

### Phase 4 — Auth Module

> Gunakan **session-based auth** (simpan session ID di database, kirim via cookie) atau **JWT** (kirim token via header/cookie). Pilih salah satu, dokumentasikan pilihannya.

- [ ] **4.1** **`auth.service.ts`** — Implementasikan fungsi-fungsi berikut:
  - `register(name, email, password)` → hash password dengan `Bun.password.hash()`, simpan user baru ke DB, kembalikan data user
  - `login(email, password)` → cari user by email, verifikasi password dengan `Bun.password.verify()`, buat session/token, kembalikan session ID atau token
  - `logout(sessionId)` → hapus record session dari DB (jika session-based)
  - `getCurrentUser(sessionId)` → lookup session di DB, kembalikan data user terkait

- [ ] **4.2** **`auth.routes.ts`** — Daftarkan endpoint berikut ke Elysia:

  | Method | Path | Deskripsi |
  |--------|------|-----------|
  | `POST` | `/auth/register` | Registrasi user baru |
  | `POST` | `/auth/login` | Login, set session cookie |
  | `POST` | `/auth/logout` | Logout, hapus session |
  | `GET` | `/auth/me` | Ambil data user yang sedang login |

- [ ] **4.3** Tambahkan validasi request body menggunakan Elysia's built-in `t` (TypeBox) schema untuk setiap endpoint

---

### Phase 5 — Auth Middleware

- [ ] **5.1** Buat `src/middleware/auth.middleware.ts` yang:
  - Membaca session cookie / Authorization header dari request
  - Memvalidasi session ke database (atau memverifikasi JWT)
  - Jika valid, inject data `user` ke dalam Elysia context (`ctx.user`)
  - Jika tidak valid, kembalikan response `401 Unauthorized`
- [ ] **5.2** Terapkan middleware ini ke semua route yang membutuhkan autentikasi (seluruh route transaksi)

---

### Phase 6 — Transactions Module

- [ ] **6.1** **`transactions.service.ts`** — Implementasikan fungsi-fungsi berikut:
  - `createTransaction(userId, data)` → hitung `margin = harga_jual - harga_modal`, simpan ke DB, kembalikan transaksi yang dibuat
  - `getTransactions(userId, filters?)` → ambil list transaksi milik user (opsional: filter by `jenis_produk`, `status_bayar`, atau range tanggal)
  - `getProfitLossSummary(userId, filters?)` → query agregasi ke DB untuk menghitung:
    - Total `harga_jual` (total pendapatan)
    - Total `harga_modal` (total modal)
    - Total `margin` (total laba bersih)
    - Jumlah transaksi per `jenis_produk`
    - Jumlah transaksi per `status_bayar`

- [ ] **6.2** **`transactions.routes.ts`** — Daftarkan endpoint berikut ke Elysia (semua dilindungi auth middleware):

  | Method | Path | Deskripsi |
  |--------|------|-----------|
  | `POST` | `/transactions` | Tambah transaksi baru |
  | `GET` | `/transactions` | Ambil list semua transaksi |
  | `GET` | `/transactions/summary` | Ambil ringkasan laba-rugi |

- [ ] **6.3** Tambahkan validasi request body/query menggunakan Elysia TypeBox schema

---

### Phase 7 — Entry Point & Final Assembly

- [ ] **7.1** Di `src/index.ts`, buat instance Elysia utama
- [ ] **7.2** Pasang plugin-plugin global (cookie plugin, error handler, logger jika ada)
- [ ] **7.3** Gunakan `.use()` untuk mendaftarkan `authRoutes` dan `transactionsRoutes`
- [ ] **7.4** Jalankan server di port yang dikonfigurasi lewat `.env` (default: `3000`)

---

### Phase 8 — Testing & Verifikasi

- [ ] **8.1** Uji semua endpoint menggunakan HTTP client (Postman, Hoppscotch, atau file `.http`)
- [ ] **8.2** Verifikasi flow lengkap:
  1. Register → Login → dapat cookie/token
  2. Tambah beberapa transaksi (tiket pesawat & hotel, berbagai status bayar)
  3. Get list transaksi → data tampil benar
  4. Get summary → angka laba-rugi akurat
  5. Logout → session terhapus → akses `/auth/me` ditolak

---

## 🗂️ Catatan Teknis

> [!NOTE]
> `margin` sebaiknya dihitung di **application layer** (service), bukan disimpan langsung dari input user, untuk menjaga konsistensi data.

> [!TIP]
> Manfaatkan Elysia's **plugin system** untuk memisahkan `authRoutes` dan `transactionsRoutes` sebagai Elysia plugin tersendiri agar kode tetap modular dan mudah di-maintain.

> [!IMPORTANT]
> Pastikan password **tidak pernah** disimpan dalam bentuk plaintext. Gunakan `Bun.password.hash()` yang sudah built-in dan aman (bcrypt/argon2).

> [!WARNING]
> Jangan commit file `.env` ke repository. Tambahkan `.env` ke `.gitignore` sejak awal.

---

## 📦 Referensi

- [Bun Docs](https://bun.sh/docs)
- [Elysia.js Docs](https://elysiajs.com/introduction.html)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Drizzle + MySQL Guide](https://orm.drizzle.team/docs/get-started-mysql)
