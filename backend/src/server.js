import dotenv from "dotenv";
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { registerRoutes } from "./routes/index.js";
import { closePrismaClient } from "./database/prismaClient.js";

dotenv.config();

const buildServer = () => {
  const app = Fastify({ logger: true });

  app.register(cors, {
    origin: true,
    credentials: true,
  });
  app.register(multipart);

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    const message = String(error?.message || "");
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
  const host = process.env.BACKEND_HOST || "0.0.0.0";
  const port = Number(process.env.BACKEND_PORT || 3001);

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
