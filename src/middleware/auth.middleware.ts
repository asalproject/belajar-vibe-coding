import { Elysia } from "elysia";
import { authService } from "../modules/auth/auth.service";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

async function extractUser(cookie: any, headers: Record<string, string | undefined>): Promise<AuthUser | null> {
  const rawCookie = cookie?.session_id?.value;
  let sessionId: string | undefined =
    typeof rawCookie === "string" ? rawCookie : undefined;

  if (!sessionId) {
    const authHeader = headers["authorization"] || headers["Authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      sessionId = authHeader.slice(7).trim();
    }
  }

  if (!sessionId) {
    return null;
  }

  const user = await authService.getCurrentUser(sessionId);
  return user as AuthUser | null;
}

export const authMiddleware = new Elysia({ name: "auth-middleware" }).derive(
  { as: "scoped" },
  async ({ cookie, headers }) => {
    const user = await extractUser(cookie, headers);
    return { user };
  }
);

export const requireAuth = new Elysia({ name: "require-auth" })
  .derive({ as: "scoped" }, async ({ cookie, headers }) => {
    const user = await extractUser(cookie, headers);
    return { user };
  })
  .onBeforeHandle({ as: "scoped" }, ({ user, status }) => {
    if (!user) {
      return status(401, {
        success: false,
        message: "Unauthorized: Silakan login terlebih dahulu",
      });
    }
  })
  .resolve({ as: "scoped" }, ({ user }) => {
    return { user: user as AuthUser };
  });
