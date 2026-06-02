import dotenv from "dotenv";
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { registerRoutes } from "./routes/index.js";
import { closePrismaClient } from "./database/prismaClient.js";
import { validateRuntimeEnv } from "./config/env.js";

dotenv.config();
validateRuntimeEnv();

const parseAllowedOrigins = () =>
  String(process.env.FRONTEND_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const resolveHost = () => {
  const configuredHost = String(process.env.BACKEND_HOST || "")
    .replaceAll('"', "")
    .replaceAll("'", "")
    .trim();

  if (String(process.env.NODE_ENV || "").toLowerCase() === "production") {
    return "0.0.0.0";
  }

  return configuredHost || "0.0.0.0";
};

const resolvePort = () => {
  const rawPort = process.env.PORT || process.env.BACKEND_PORT || "3001";
  const parsed = Number(rawPort);
  if (!Number.isFinite(parsed) || parsed <= 0) return 3001;
  return parsed;
};

const buildServer = () => {
  const app = Fastify({ logger: true });
  const allowedOrigins = parseAllowedOrigins();

  app.register(cors, {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin não permitida"), false);
    },
    credentials: true,
  });
  app.register(multipart);

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    const message = String(error?.message || "");
    if (message.includes("Origin não permitida")) {
      return reply.status(403).send({
        message: "Origin não permitida",
      });
    }
    const isDatabaseUnavailable = message.includes("Can't reach database server");
    if (isDatabaseUnavailable) {
      return reply.status(503).send({
        message: "Banco de dados indisponível. Verifique DATABASE_URL/DIRECT_URL.",
      });
    }
    reply.status(error.statusCode || 500).send({
      message: error.message || "Erro interno do servidor",
    });
  });

  app.register(registerRoutes);
  return app;
};

const start = async () => {
  const app = buildServer();
  const host = resolveHost();
  const port = resolvePort();

  try {
    await app.listen({ host, port });
    app.log.info(`Backend ativo em http://${host}:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }

  const shutdown = async () => {
    await closePrismaClient();
    await app.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

start();
