import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { db } from "../../db";
import { transactions } from "../../db/schema";

export interface CreateTransactionDTO {
  tanggal: string; // YYYY-MM-DD
  jenisProduk: "tiket_pesawat" | "hotel";
  namaPelanggan: string;
  kodeBooking: string;
  hargaModal: number;
  hargaJual: number;
  statusBayar?: "lunas" | "belum_lunas" | "dp";
}

export interface TransactionFilters {
  jenisProduk?: "tiket_pesawat" | "hotel";
  statusBayar?: "lunas" | "belum_lunas" | "dp";
  tanggalMulai?: string;
  tanggalAkhir?: string;
  limit?: number;
  offset?: number;
}

export class TransactionsService {
  async createTransaction(userId: number, data: CreateTransactionDTO) {
    const hargaModal = Number(data.hargaModal);
    const hargaJual = Number(data.hargaJual);
    const margin = Number((hargaJual - hargaModal).toFixed(2));

    const [result] = await db.insert(transactions).values({
      userId,
      tanggal: data.tanggal,
      jenisProduk: data.jenisProduk,
      namaPelanggan: data.namaPelanggan,
      kodeBooking: data.kodeBooking,
      hargaModal: hargaModal.toFixed(2),
      hargaJual: hargaJual.toFixed(2),
      margin: margin.toFixed(2),
      statusBayar: data.statusBayar || "belum_lunas",
    });

    const [created] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, result.insertId))
      .limit(1);

    return created;
  }

  async getTransactions(userId: number, filters: TransactionFilters = {}) {
    const conditions = [eq(transactions.userId, userId)];

    if (filters.jenisProduk) {
      conditions.push(eq(transactions.jenisProduk, filters.jenisProduk));
    }

    if (filters.statusBayar) {
      conditions.push(eq(transactions.statusBayar, filters.statusBayar));
    }

    if (filters.tanggalMulai) {
      conditions.push(gte(transactions.tanggal, filters.tanggalMulai));
    }

    if (filters.tanggalAkhir) {
      conditions.push(lte(transactions.tanggal, filters.tanggalAkhir));
    }

    let query = db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.tanggal), desc(transactions.id));

    if (filters.limit) {
      query = query.limit(filters.limit) as typeof query;
    }
    if (filters.offset) {
      query = query.offset(filters.offset) as typeof query;
    }

    return await query;
  }

  async getProfitLossSummary(
    userId: number,
    filters?: { tanggalMulai?: string; tanggalAkhir?: string }
  ) {
    const conditions = [eq(transactions.userId, userId)];

    if (filters?.tanggalMulai) {
      conditions.push(gte(transactions.tanggal, filters.tanggalMulai));
    }

    if (filters?.tanggalAkhir) {
      conditions.push(lte(transactions.tanggal, filters.tanggalAkhir));
    }

    const whereClause = and(...conditions);

    // 1. Overall totals
    const [overall] = await db
      .select({
        totalTransaksi: sql<number>`COUNT(${transactions.id})`,
        totalPendapatan: sql<string>`COALESCE(SUM(${transactions.hargaJual}), 0)`,
        totalModal: sql<string>`COALESCE(SUM(${transactions.hargaModal}), 0)`,
        totalMargin: sql<string>`COALESCE(SUM(${transactions.margin}), 0)`,
      })
      .from(transactions)
      .where(whereClause);

    // 2. Summary per jenis produk
    const perProdukRows = await db
      .select({
        jenisProduk: transactions.jenisProduk,
        count: sql<number>`COUNT(${transactions.id})`,
        totalPendapatan: sql<string>`COALESCE(SUM(${transactions.hargaJual}), 0)`,
        totalModal: sql<string>`COALESCE(SUM(${transactions.hargaModal}), 0)`,
        totalMargin: sql<string>`COALESCE(SUM(${transactions.margin}), 0)`,
      })
      .from(transactions)
      .where(whereClause)
      .groupBy(transactions.jenisProduk);

    // 3. Summary per status bayar
    const perStatusRows = await db
      .select({
        statusBayar: transactions.statusBayar,
        count: sql<number>`COUNT(${transactions.id})`,
        totalNilai: sql<string>`COALESCE(SUM(${transactions.hargaJual}), 0)`,
      })
      .from(transactions)
      .where(whereClause)
      .groupBy(transactions.statusBayar);

    return {
      totalTransaksi: Number(overall?.totalTransaksi || 0),
      totalPendapatan: Number(overall?.totalPendapatan || 0),
      totalModal: Number(overall?.totalModal || 0),
      totalLabaBersih: Number(overall?.totalMargin || 0),
      ringkasanPerProduk: perProdukRows.map((r) => ({
        jenisProduk: r.jenisProduk,
        jumlahTransaksi: Number(r.count),
        totalPendapatan: Number(r.totalPendapatan),
        totalModal: Number(r.totalModal),
        totalMargin: Number(r.totalMargin),
      })),
      ringkasanPerStatusBayar: perStatusRows.map((r) => ({
        statusBayar: r.statusBayar,
        jumlahTransaksi: Number(r.count),
        totalNilai: Number(r.totalNilai),
      })),
    };
  }
}

export const transactionsService = new TransactionsService();
