import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

let prisma = null;

const buildPrismaLogConfig = () => {
  const baseLevels = process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];
  const queryLoggingEnabled =
    String(process.env.PRISMA_LOG_QUERIES || "").toLowerCase() === "true" ||
    Number(process.env.SLOW_QUERY_THRESHOLD_MS || 0) > 0;
  if (!queryLoggingEnabled) return baseLevels;
  return [
    ...baseLevels,
    { emit: "event", level: "query" },
  ];
};

const attachPrismaQueryLogger = (client) => {
  const enabled =
    String(process.env.PRISMA_LOG_QUERIES || "").toLowerCase() === "true" ||
    Number(process.env.SLOW_QUERY_THRESHOLD_MS || 0) > 0;
  if (!enabled) return;
  const thresholdMs = Math.max(1, Number(process.env.SLOW_QUERY_THRESHOLD_MS || 400));
  client.$on("query", (event) => {
    const duration = Number(event.duration || 0);
    if (!Number.isFinite(duration) || duration < thresholdMs) return;
    const normalizedQuery = String(event.query || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 240);
    console.warn(
      `[prisma][slow-query] ${duration}ms threshold=${thresholdMs}ms query="${normalizedQuery}"`
    );
  });
};

const requireDatabaseConfig = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não configurada no backend/.env");
  }
};

export const getPrismaClient = () => {
  requireDatabaseConfig();
  if (!prisma) {
    prisma = new PrismaClient({
      log: buildPrismaLogConfig(),
    });
    attachPrismaQueryLogger(prisma);
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
