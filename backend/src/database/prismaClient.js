import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

let prisma = null;

const requireDatabaseConfig = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não configurada no backend/.env");
  }
};

export const getPrismaClient = () => {
  requireDatabaseConfig();
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return prisma;
};

export const verifyDatabaseConnection = async () => {
  const client = getPrismaClient();
  await client.$queryRaw`SELECT 1`;
  return true;
};

export const closePrismaClient = async () => {
  if (!prisma) return;
  await prisma.$disconnect();
  prisma = null;
};
