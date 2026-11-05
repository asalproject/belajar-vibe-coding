# 📋 Issue: Frontend Dashboard — Aplikasi Pencatatan Keuangan Tiket & Hotel

## Overview

Membangun frontend dashboard interaktif dan responsif untuk aplikasi pencatatan keuangan bisnis tiket pesawat & hotel yang terhubung ke backend REST API di `http://localhost:3000`.

- **Framework / Bundler**: [React](https://react.dev/) + [Vite](https://vitejs.dev/) (TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Target Backend API**: `http://localhost:3000`

---

## ✅ Task Checklist

### Phase 1 — Project Scaffolding & Setup

- [ ] **1.1** Inisialisasi project React + TypeScript menggunakan Vite:
  ```bash
  bun create vite frontend --template react-ts
  ```
- [ ] **1.2** Install dependencies utama:
  - `tailwindcss`, `postcss`, `autoprefixer`
  - `lucide-react` — icon set modern
- [ ] **1.3** Inisialisasi dan konfigurasi Tailwind CSS (`tailwind.config.js`, `postcss.config.js`, `index.css`)
- [ ] **1.4** Setup struktur direktori frontend:
  ```
  frontend/src/
  ├── api/
  │   ├── client.ts         # Wrapper fetch / Axios dengan base URL & auth token
  │   ├── auth.ts           # Service API auth (login, register, logout, me)
  │   └── transactions.ts   # Service API transaksi (create, list, summary)
  ├── components/
  │   ├── common/           # Navbar, Button, Card, Modal, Input
  │   ├── auth/             # LoginForm, RegisterForm
  │   ├── dashboard/        # SummaryCards, Charts, ProductBreakdown
  │   └── transactions/     # TransactionForm, TransactionTable, Filters
  ├── context/
  │   └── AuthContext.tsx   # Global state untuk auth & current user
  ├── pages/
  │   ├── LoginPage.tsx
  │   ├── RegisterPage.tsx
  │   └── DashboardPage.tsx
  ├── types/
  │   └── index.ts          # Type definition User, Transaction, Summary
  ├── App.tsx
  └── main.tsx
  ```

---

### Phase 2 — Type Definitions & API Client Layer

- [ ] **2.1** Definisikan interface Typescript di `src/types/index.ts`:
  - `User`: `id`, `name`, `email`, `createdAt`
  - `Transaction`: `id`, `userId`, `tanggal`, `jenisProduk`, `namaPelanggan`, `kodeBooking`, `hargaModal`, `hargaJual`, `margin`, `statusBayar`, `createdAt`
  - `Summary`: `totalTransaksi`, `totalPendapatan`, `totalModal`, `totalLabaBersih`, `ringkasanPerProduk`, `ringkasanPerStatusBayar`
- [ ] **2.2** Buat API client di `src/api/client.ts` yang menangani:
  - Base URL backend (`http://localhost:3000`)
  - Inject header `Authorization: Bearer <sessionId>` dari `localStorage`
  - Interceptor error response (auto logout jika 401 Unauthorized)

---

### Phase 3 — Authentication & State Management

- [ ] **3.1** Buat `AuthContext.tsx` untuk mengelola:
  - `user` (data user login)
  - `token` / `sessionId` tersimpan di `localStorage`
  - Fungsi `login(email, password)`
  - Fungsi `register(name, email, password)`
  - Fungsi `logout()`
  - Loading state saat inisialisasi verifikasi session (`/auth/me`)
- [ ] **3.2** Buat halaman **Login** & **Register**:
  - Validasi form input
  - Pesan error interaktif jika kredensial salah
  - Switch antara mode login dan register

---

### Phase 4 — Dashboard Metrics & Laba-Rugi

- [ ] **4.1** Buat komponen **Summary Cards** (KPI Cards) menampilkan:
  - 💰 **Total Pendapatan** (Rupiah)
  - 🏷️ **Total Modal** (Rupiah)
  - 📈 **Total Laba Bersih** (Rupiah)
  - 📋 **Total Transaksi**
- [ ] **4.2** Buat kartu perbandingan performa:
  - Penjualan Tiket Pesawat vs Hotel (jumlah & laba)
  - Distribusi status pembayaran (Lunas, DP, Belum Lunas)
- [ ] **4.3** Filter tanggal untuk ringkasan laba-rugi (`tanggalMulai`, `tanggalAkhir`)

---

### Phase 5 — Manajemen & Form Pencatatan Transaksi

- [ ] **5.1** Buat **Form Tambah Transaksi**:
  - Input: Tanggal, Jenis Produk (`tiket_pesawat` / `hotel`), Nama Pelanggan, Kode Booking, Harga Modal, Harga Jual, Status Bayar (`lunas`, `belum_lunas`, `dp`)
  - **Live Preview Margin**: hitung estimasi margin secara realtime di form (`hargaJual - hargaModal`)
  - Format angka ribuan / Rupiah yang user-friendly
- [ ] **5.2** Buat **Tabel Riwayat Transaksi**:
  - Kolom: Tanggal, Produk (badge warna: biru pesawat, ungu hotel), Kode Booking, Nama Pelanggan, Modal, Jual, Margin (badge hijau), Status Bayar (badge lunas/dp/belum lunas)
  - Filter interaktif: filter jenis produk & filter status pembayaran
  - Empty state yang rapi saat belum ada transaksi

---

### Phase 6 — UI/UX Polish & Formatting

- [ ] **6.1** Format angka ke format mata uang Rupiah Indonesia (`Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })`)
- [ ] **6.2** Format tanggal ke format lokal Indonesia (`DD MMMM YYYY`)
- [ ] **6.3** Tambahkan toast notification untuk feedback aksi (transaksi berhasil disimpan, login sukses, dll)
- [ ] **6.4** Desain responsive untuk tampilan smartphone, tablet, dan desktop

---

### Phase 7 — Testing & Verifikasi End-to-End

- [ ] **7.1** Uji alur pengguna:
  1. Registrasi akun baru → Login
  2. Tambah transaksi tiket pesawat & hotel
  3. Cek pembaruan realtime pada Summary Cards & Tabel
  4. Cek filter transaksi
  5. Logout → Proteksi redirect kembali ke login
- [ ] **7.2** Pastikan tidak ada error CORS antara frontend Vite (`http://localhost:5173`) dan backend (`http://localhost:3000`)

---

## 🗂️ Referensi

- Backend API: `http://localhost:3000`
- [Vite Documentation](https://vitejs.dev/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons/)
