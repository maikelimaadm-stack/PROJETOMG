import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

let prisma = null;

const canUsePrisma = () => Boolean(process.env.DATABASE_URL);

export const getPrismaClient = () => {
  if (!canUsePrisma()) return null;
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return prisma;
};

export const closePrismaClient = async () => {
  if (!prisma) return;
  await prisma.$disconnect();
  prisma = null;
};
