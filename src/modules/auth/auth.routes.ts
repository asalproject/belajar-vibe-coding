import { Elysia, t } from "elysia";
import { authService } from "./auth.service";
import { authMiddleware, requireAuth } from "../../middleware/auth.middleware";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(authMiddleware)
  .post(
    "/register",
    async ({ body, set }) => {
      try {
        const user = await authService.register(body);
        set.status = 201;
        return {
          success: true,
          message: "Registrasi berhasil",
          data: user,
        };
      } catch (err: any) {
        set.status = 400;
        return {
          success: false,
          message: err.message || "Gagal melakukan registrasi",
        };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
      }),
    }
  )
  .post(
    "/login",
    async ({ body, cookie, set }) => {
      try {
        const result = await authService.login(body);

        if (cookie.session_id) {
          cookie.session_id.set({
            value: result.sessionId,
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
          });
        }

        return {
          success: true,
          message: "Login berhasil",
          data: {
            user: result.user,
            sessionId: result.sessionId,
            expiresAt: result.expiresAt,
          },
        };
      } catch (err: any) {
        set.status = 401;
        return {
          success: false,
          message: err.message || "Gagal login",
        };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 1 }),
      }),
    }
  )
  .post("/logout", async ({ cookie, headers }) => {
    let currentSessionId: string | undefined = undefined;
    const cookieVal = cookie.session_id?.value;
    if (typeof cookieVal === "string") {
      currentSessionId = cookieVal;
    }

    if (!currentSessionId) {
      const authHeader = headers["authorization"];
      if (authHeader && authHeader.startsWith("Bearer ")) {
        currentSessionId = authHeader.slice(7).trim();
      }
    }

    if (currentSessionId) {
      await authService.logout(currentSessionId);
    }

    if (cookie.session_id) {
      cookie.session_id.remove();
    }

    return {
      success: true,
      message: "Logout berhasil",
    };
  })
  .use(requireAuth)
  .get("/me", ({ user }) => {
    return {
      success: true,
      data: user,
    };
  });
