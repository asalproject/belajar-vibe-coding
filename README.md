# ✈️🏨 Backend Pencatatan Keuangan Tiket Pesawat & Hotel

REST API untuk pencatatan keuangan bisnis tiket pesawat dan hotel yang dibangun menggunakan **Bun**, **Elysia.js**, **Drizzle ORM**, dan **MySQL**.

---

## 🛠️ Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Web Framework**: [Elysia.js](https://elysiajs.com/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: MySQL / MariaDB

---

## 🚀 Persyaratan Sistem

1. [Bun](https://bun.sh/) (v1.0+)
2. MySQL / MariaDB (misal via XAMPP)

---

## ⚙️ Cara Menjalankan

### 1. Clone & Install Dependencies

```bash
bun install
```

### 2. Konfigurasi Environment Variable

Salin `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Pastikan konfigurasi koneksi MySQL sesuai:

```env
DATABASE_URL=mysql://root:@127.0.0.1:3306/belajar_vibe_coding
PORT=3000
```

### 3. Buat Database & Jalankan Migrasi

Buat database `belajar_vibe_coding` di MySQL, lalu jalankan migrasi Drizzle:

```bash
bun run db:migrate
```

### 4. Jalankan Server

Mode development:
```bash
bun run dev
```

Mode production:
```bash
bun run start
```

Server akan aktif di `http://localhost:3000`.

### 5. Menjalankan Automated Test

```bash
bun run scripts/test-api.ts
```

---

## 📚 Daftar API Endpoints

### 1. Healthcheck
- **GET** `/` — Informasi status server & daftar endpoint

### 2. Autentikasi (`/auth`)
- **POST** `/auth/register` — Registrasi user baru
  ```json
  {
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "password": "password123"
  }
  ```
- **POST** `/auth/login` — Login & mendapatkan Session Cookie / Session ID
  ```json
  {
    "email": "budi@example.com",
    "password": "password123"
  }
  ```
- **POST** `/auth/logout` — Logout & menghapus session
- **GET** `/auth/me` *(Protected)* — Mendapatkan data user saat ini

### 3. Transaksi (`/transactions`) — *Semua Dilindungi Autentikasi*
- **POST** `/transactions` — Mencatat transaksi baru (margin otomatis dihitung: `hargaJual - hargaModal`)
  ```json
  {
    "tanggal": "2026-11-05",
    "jenisProduk": "tiket_pesawat",
    "namaPelanggan": "Ahmad Dahlan",
    "kodeBooking": "GA-821-JKT-SUB",
    "hargaModal": 1200000,
    "hargaJual": 1450000,
    "statusBayar": "lunas"
  }
  ```
- **GET** `/transactions` — Mengambil daftar transaksi (mendukung filter: `jenisProduk`, `statusBayar`, `tanggalMulai`, `tanggalAkhir`)
- **GET** `/transactions/summary` — Mengambil ringkasan laba-rugi:
  - Total pendapatan (`hargaJual`)
  - Total modal (`hargaModal`)
  - Total laba bersih (`margin`)
  - Breakdown per `jenisProduk` & `statusBayar`

---

## 🗄️ Skema Database

- **`users`**: `id`, `name`, `email`, `password`, `created_at`
- **`sessions`**: `id` (UUID), `user_id`, `expires_at`, `created_at`
- **`transactions`**: `id`, `user_id`, `tanggal`, `jenis_produk` (`tiket_pesawat` / `hotel`), `nama_pelanggan`, `kode_booking`, `harga_modal`, `harga_jual`, `margin`, `status_bayar` (`lunas` / `belum_lunas` / `dp`), `created_at`, `updated_at`
