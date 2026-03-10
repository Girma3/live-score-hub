import dotenv from "dotenv";
dotenv.config({ path: "../db/prisma/.env" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis;

let prismaGlobal = globalForPrisma.prismaGlobal;

if (!prismaGlobal) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing DATABASE_URL");
  }

  const adapter = new PrismaPg({ connectionString });

  prismaGlobal = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prismaGlobal = prismaGlobal;
  }
}

export default prismaGlobal;
