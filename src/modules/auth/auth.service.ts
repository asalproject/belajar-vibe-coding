import { eq, and, gt } from "drizzle-orm";
import { db } from "../../db";
import { users, sessions, type User, type NewUser } from "../../db/schema";

export class AuthService {
  async register(data: { name: string; email: string; password: string }) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await Bun.password.hash(data.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    const [result] = await db.insert(users).values({
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
    });

    const [createdUser] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, result.insertId))
      .limit(1);

    return createdUser;
  }

  async login(data: { email: string; password: string }) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email.toLowerCase()))
      .limit(1);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValid = await Bun.password.verify(data.password, user.password);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      expiresAt,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      sessionId,
      expiresAt,
    };
  }

  async resetPassword(data: { email: string; newPassword: string }) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email.toLowerCase()))
      .limit(1);

    if (!user) {
      throw new Error("Email tidak terdaftar dalam sistem");
    }

    const hashedPassword = await Bun.password.hash(data.newPassword, {
      algorithm: "bcrypt",
      cost: 10,
    });

    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, user.id));

    // Invalidate existing sessions so user logs in with new password
    await db.delete(sessions).where(eq(sessions.userId, user.id));

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async logout(sessionId: string) {
    if (!sessionId) return false;
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return true;
  }

  async getCurrentUser(sessionId: string) {
    if (!sessionId) return null;

    const [record] = await db
      .select({
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
        },
        session: {
          id: sessions.id,
          expiresAt: sessions.expiresAt,
        },
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date()))
      )
      .limit(1);

    return record ? record.user : null;
  }
}

export const authService = new AuthService();
