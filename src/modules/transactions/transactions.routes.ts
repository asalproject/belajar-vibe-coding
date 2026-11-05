import { Elysia, t } from "elysia";
import { transactionsService } from "./transactions.service";
import { requireAuth } from "../../middleware/auth.middleware";

export const transactionsRoutes = new Elysia({ prefix: "/transactions" })
  .use(requireAuth)
  .post(
    "/",
    async ({ user, body, set }) => {
      try {
        const transaction = await transactionsService.createTransaction(
          user.id,
          body
        );

        set.status = 201;
        return {
          success: true,
          message: "Transaksi berhasil dicatat",
          data: transaction,
        };
      } catch (err: any) {
        set.status = 400;
        return {
          success: false,
          message: err.message || "Gagal mencatat transaksi",
        };
      }
    },
    {
      body: t.Object({
        tanggal: t.String({
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          error: "Format tanggal harus YYYY-MM-DD",
        }),
        jenisProduk: t.Union([
          t.Literal("tiket_pesawat"),
          t.Literal("hotel"),
        ]),
        namaPelanggan: t.String({ minLength: 1 }),
        kodeBooking: t.String({ minLength: 1 }),
        hargaModal: t.Number({ minimum: 0 }),
        hargaJual: t.Number({ minimum: 0 }),
        statusBayar: t.Optional(
          t.Union([
            t.Literal("lunas"),
            t.Literal("belum_lunas"),
            t.Literal("dp"),
          ])
        ),
      }),
    }
  )
  .get(
    "/",
    async ({ user, query }) => {
      const transactions = await transactionsService.getTransactions(user.id, {
        jenisProduk: query.jenisProduk,
        statusBayar: query.statusBayar,
        tanggalMulai: query.tanggalMulai,
        tanggalAkhir: query.tanggalAkhir,
        limit: query.limit ? Number(query.limit) : undefined,
        offset: query.offset ? Number(query.offset) : undefined,
      });

      return {
        success: true,
        count: transactions.length,
        data: transactions,
      };
    },
    {
      query: t.Object({
        jenisProduk: t.Optional(
          t.Union([t.Literal("tiket_pesawat"), t.Literal("hotel")])
        ),
        statusBayar: t.Optional(
          t.Union([
            t.Literal("lunas"),
            t.Literal("belum_lunas"),
            t.Literal("dp"),
          ])
        ),
        tanggalMulai: t.Optional(t.String()),
        tanggalAkhir: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
      }),
    }
  )
  .get(
    "/summary",
    async ({ user, query }) => {
      const summary = await transactionsService.getProfitLossSummary(user.id, {
        tanggalMulai: query.tanggalMulai,
        tanggalAkhir: query.tanggalAkhir,
      });

      return {
        success: true,
        data: summary,
      };
    },
    {
      query: t.Object({
        tanggalMulai: t.Optional(t.String()),
        tanggalAkhir: t.Optional(t.String()),
      }),
    }
  );
