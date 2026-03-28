import PrismaPkg from "@prisma/client";
const { PrismaClient } = PrismaPkg;
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  // @ts-ignore
  url: process.env.DATABASE_URL || "file:../../storage/test.db",
});

const isTest = process.env.NODE_ENV === "test";

export const prisma = new PrismaClient({
  adapter,
  log: isTest ? ["error"] : ["query", "info", "warn", "error"],
});

export * from "@prisma/client";
