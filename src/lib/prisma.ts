import "server-only";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma Client singleton, wired to MySQL/MariaDB through the official
 * driver adapter (Prisma ORM 7 ships without a Rust query engine by
 * default — see the header comment in prisma/schema.prisma).
 *
 * Cached on `globalThis` in development so Next.js's hot-reload doesn't
 * open a fresh connection pool on every file save.
 */
const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
