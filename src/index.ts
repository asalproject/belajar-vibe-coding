import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authRoutes } from "./modules/auth/auth.routes";
import { transactionsRoutes } from "./modules/transactions/transactions.routes";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

export const app = new Elysia()
  .use(cors())
  .get("/", ({ headers, redirect }) => {
    if (headers["accept"]?.includes("text/html")) {
      return redirect("/dashboard");
    }
    return {
      name: "API Pencatatan Keuangan Tiket & Hotel",
      status: "running",
      version: "1.0.0",
      dashboard: `http://localhost:${port}/dashboard`,
      garudaEditor: `http://localhost:${port}/garuda-editor`,
      endpoints: {
        auth: [
          "POST /auth/register",
          "POST /auth/login",
          "POST /auth/reset-password",
          "POST /auth/logout",
          "GET /auth/me",
        ],
        transactions: [
          "POST /transactions",
          "GET /transactions",
          "GET /transactions/summary",
        ],
      },
    };
  })
  .get("/dashboard", () => {
    const file = Bun.file("./public/dashboard.html");
    return new Response(file, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  })
  .get("/garuda-editor", () => {
    const file = Bun.file("./public/garuda-editor.html");
    return new Response(file, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  })
  .use(authRoutes)
  .use(transactionsRoutes);

app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`);
  console.log(`📊 Dashboard UI: http://localhost:${port}/dashboard`);
  console.log(`✈️ Garuda E-Ticket Editor: http://localhost:${port}/garuda-editor`);
});
