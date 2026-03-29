import { eq } from "drizzle-orm";
import type { DrizzleDB } from "../index";
import { type NewUser, type User, users } from "../schema";

export const createUserRepository = (db: DrizzleDB) => ({
  findByEmail: async (email: string): Promise<User | undefined> => {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  },
  create: async (data: NewUser): Promise<User> => {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  },
});

export type UserRepository = ReturnType<typeof createUserRepository>;
