import PrismaPkg from "@prisma/client";
const { PrismaClient } = PrismaPkg;
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  // @ts-ignore
  url: process.env.DATABASE_URL || "file:../../storage/test.db",
});

export const prisma = new PrismaClient({
  adapter,
  log: [
    { emit: "stdout", level: "query" }, // これでSQLが出る
    { emit: "stdout", level: "error" },
    { emit: "stdout", level: "warn" },
  ],
});

export * from "@prisma/client";
