import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL || "mysql://dummy:dummy@127.0.0.1:3306/dummy";
  const adapter = new PrismaMariaDb(dbUrl);
  return new PrismaClient({ adapter });
}


const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
