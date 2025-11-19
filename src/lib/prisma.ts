import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Prevent multiple instances in dev hot-reload
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set. Add your Neon connection string to .env at the project root.");
}

// Configure pg Pool with Neon URL (sslmode=require is handled by the URL)
const pool = new Pool({ connectionString: url });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;