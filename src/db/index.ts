import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const connectionUrl =
  process.env.DATABASE_URL || "mysql://root:@127.0.0.1:3306/belajar_vibe_coding";

export const poolConnection = mysql.createPool(connectionUrl);
export const db = drizzle(poolConnection, { schema, mode: "default" });
