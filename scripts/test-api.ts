import { app } from "../src/index";

async function runTests() {
  console.log("🧪 Memulai pengujian API...\n");

  const baseUrl = "http://localhost:3000";

  // 1. Healthcheck
  console.log("1. Pengujian Healthcheck GET /");
  const res1 = await app.handle(new Request(`${baseUrl}/`));
  const data1 = (await res1.json()) as any;
  console.log("Status:", res1.status, JSON.stringify(data1));
  if (res1.status !== 200) throw new Error("Healthcheck gagal");

  // 2. Register
  console.log("\n2. Pengujian Registrasi POST /auth/register");
  const testEmail = `test_${Date.now()}@tiketbisnis.com`;
  const res2 = await app.handle(
    new Request(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Budi Santoso",
        email: testEmail,
        password: "password123",
      }),
    })
  );
  const data2 = (await res2.json()) as any;
  console.log("Status:", res2.status, JSON.stringify(data2));
  if (res2.status !== 201 || !data2.success) throw new Error("Register gagal");

  // 3. Login
  console.log("\n3. Pengujian Login POST /auth/login");
  const res3 = await app.handle(
    new Request(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "password123",
      }),
    })
  );
  const data3 = (await res3.json()) as any;
  console.log("Status:", res3.status, JSON.stringify(data3));
  if (res3.status !== 200 || !data3.data?.sessionId) throw new Error("Login gagal");

  const sessionId = data3.data.sessionId;

  // 4. Test Protected Route without Auth
  console.log("\n4. Pengujian Akses Protected Route tanpa Auth GET /auth/me");
  const res4 = await app.handle(new Request(`${baseUrl}/auth/me`));
  const data4 = (await res4.json()) as any;
  console.log("Status:", res4.status, JSON.stringify(data4));
  if (res4.status !== 401) throw new Error("Harusnya 401 Unauthorized");

  // 5. Test Current User with Bearer token
  console.log("\n5. Pengujian Current User dengan Token GET /auth/me");
  const res5 = await app.handle(
    new Request(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${sessionId}` },
    })
  );
  const data5 = (await res5.json()) as any;
  console.log("Status:", res5.status, JSON.stringify(data5));
  if (res5.status !== 200 || data5.data.email !== testEmail)
    throw new Error("Current user gagal");

  // 6. Create Transaction 1 (Tiket Pesawat)
  console.log("\n6. Pengujian Tambah Transaksi Tiket Pesawat POST /transactions");
  const res6 = await app.handle(
    new Request(`${baseUrl}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionId}`,
      },
      body: JSON.stringify({
        tanggal: "2026-11-05",
        jenisProduk: "tiket_pesawat",
        namaPelanggan: "Ahmad Dahlan",
        kodeBooking: "GA-821-JKT-SUB",
        hargaModal: 1200000,
        hargaJual: 1450000,
        statusBayar: "lunas",
      }),
    })
  );
  const data6 = (await res6.json()) as any;
  console.log("Status:", res6.status, JSON.stringify(data6));
  if (res6.status !== 201 || Number(data6.data.margin) !== 250000)
    throw new Error("Margin transaksi 1 tidak sesuai");

  // 7. Create Transaction 2 (Hotel)
  console.log("\n7. Pengujian Tambah Transaksi Hotel POST /transactions");
  const res7 = await app.handle(
    new Request(`${baseUrl}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionId}`,
      },
      body: JSON.stringify({
        tanggal: "2026-11-06",
        jenisProduk: "hotel",
        namaPelanggan: "Siti Rahma",
        kodeBooking: "HTL-JW-MARRIOTT",
        hargaModal: 800000,
        hargaJual: 1050000,
        statusBayar: "dp",
      }),
    })
  );
  const data7 = (await res7.json()) as any;
  console.log("Status:", res7.status, JSON.stringify(data7));
  if (res7.status !== 201 || Number(data7.data.margin) !== 250000)
    throw new Error("Margin transaksi 2 tidak sesuai");

  // 8. Get Transactions List
  console.log("\n8. Pengujian Ambil List Transaksi GET /transactions");
  const res8 = await app.handle(
    new Request(`${baseUrl}/transactions`, {
      headers: { Authorization: `Bearer ${sessionId}` },
    })
  );
  const data8 = (await res8.json()) as any;
  console.log("Status:", res8.status, "Count:", data8.count);
  if (res8.status !== 200 || data8.count < 2)
    throw new Error("List transaksi gagal");

  // 9. Get Summary Laba Rugi
  console.log("\n9. Pengujian Ringkasan Laba Rugi GET /transactions/summary");
  const res9 = await app.handle(
    new Request(`${baseUrl}/transactions/summary`, {
      headers: { Authorization: `Bearer ${sessionId}` },
    })
  );
  const data9 = (await res9.json()) as any;
  console.log("Status:", res9.status, JSON.stringify(data9, null, 2));
  if (
    res9.status !== 200 ||
    data9.data.totalPendapatan !== 2500000 ||
    data9.data.totalModal !== 2000000 ||
    data9.data.totalLabaBersih !== 500000
  ) {
    throw new Error("Summary laba-rugi tidak sesuai perhitungan!");
  }

  // 10. Logout
  console.log("\n10. Pengujian Logout POST /auth/logout");
  const res10 = await app.handle(
    new Request(`${baseUrl}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${sessionId}` },
    })
  );
  const data10 = (await res10.json()) as any;
  console.log("Status:", res10.status, JSON.stringify(data10));
  if (res10.status !== 200 || !data10.success)
    throw new Error("Logout gagal");

  // 11. Test Protected Route after Logout
  console.log("\n11. Pengujian Akses setelah Logout GET /auth/me");
  const res11 = await app.handle(
    new Request(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${sessionId}` },
    })
  );
  const data11 = (await res11.json()) as any;
  console.log("Status:", res11.status, JSON.stringify(data11));
  if (res11.status !== 401)
    throw new Error("Harusnya 401 setelah logout");

  console.log("\n🎉 SEMUA PENGUJIAN ENDPOINT BERHASIL 100%! 🎉");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("❌ Test error:", err);
  process.exit(1);
});
