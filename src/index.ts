import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authRoutes } from "./modules/auth/auth.routes";
import { transactionsRoutes } from "./modules/transactions/transactions.routes";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

export const app = new Elysia()
  .use(cors())
  .get("/", () => ({
    name: "API Pencatatan Keuangan Tiket & Hotel",
    status: "running",
    version: "1.0.0",
    endpoints: {
      auth: [
        "POST /auth/register",
        "POST /auth/login",
        "POST /auth/logout",
        "GET /auth/me",
      ],
      transactions: [
        "POST /transactions",
        "GET /transactions",
        "GET /transactions/summary",
      ],
    },
  }))
  .use(authRoutes)
  .use(transactionsRoutes);

app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`);
});
