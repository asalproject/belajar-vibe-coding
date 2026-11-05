import {
  mysqlTable,
  int,
  varchar,
  timestamp,
  date,
  decimal,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tanggal: date("tanggal", { mode: "string" }).notNull(),
  jenisProduk: mysqlEnum("jenis_produk", ["tiket_pesawat", "hotel"]).notNull(),
  namaPelanggan: varchar("nama_pelanggan", { length: 255 }).notNull(),
  kodeBooking: varchar("kode_booking", { length: 100 }).notNull(),
  hargaModal: decimal("harga_modal", { precision: 14, scale: 2 }).notNull(),
  hargaJual: decimal("harga_jual", { precision: 14, scale: 2 }).notNull(),
  margin: decimal("margin", { precision: 14, scale: 2 }).notNull(),
  statusBayar: mysqlEnum("status_bayar", ["lunas", "belum_lunas", "dp"])
    .notNull()
    .default("belum_lunas"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  transactions: many(transactions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
