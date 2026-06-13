import dotenv from "dotenv";
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import fastifyJwt from "@fastify/jwt";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyCompress from "@fastify/compress";
import { registerRoutes } from "./routes/index.js";
import { closePrismaClient } from "./database/prismaClient.js";
import { validateRuntimeEnv } from "./config/env.js";

dotenv.config();
try {
  validateRuntimeEnv();
} catch (error) {
  // In cloud deploys we prefer a degraded boot + health diagnostics over crash loops (502).
  // Missing envs will surface in /api/health and failing routes as needed.
  console.warn(`[env] ${error.message}`);
}

const parseAllowedOrigins = () =>
  String(process.env.FRONTEND_ORIGINS || "")
    .split(",")
    .map((item) => item.trim().replaceAll('"', "").replaceAll("'", ""))
    .filter(Boolean);

const normalizeOrigin = (origin = "") => String(origin).trim().replace(/\/+$/, "");

const isWildcardEntry = (entry = "") => entry.includes("*");

const matchWildcardOrigin = (origin, pattern) => {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`, "i").test(origin);
};

const isVercelDomain = (origin = "") => {
  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

const isLocalDevOrigin = (origin = "") => {
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
};

const isOriginAllowed = (origin, allowedOrigins) => {
  if (!origin) return true;
  const normalizedOrigin = normalizeOrigin(origin);
  const isProduction = String(process.env.NODE_ENV || "").toLowerCase() === "production";

  if (!isProduction && isLocalDevOrigin(normalizedOrigin)) return true;

  if (allowedOrigins.length === 0) {
    return !isProduction;
  }

  const normalizedAllowed = allowedOrigins.map((item) => normalizeOrigin(item));
  if (normalizedAllowed.includes(normalizedOrigin)) return true;

  const wildcardMatch = normalizedAllowed
    .filter(isWildcardEntry)
    .some((pattern) => matchWildcardOrigin(normalizedOrigin, pattern));
  if (wildcardMatch) return true;

  const hasVercelOriginConfigured = normalizedAllowed.some((item) => item.includes("vercel.app"));
  if (hasVercelOriginConfigured && isVercelDomain(normalizedOrigin)) return true;

  return false;
};

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
  const pluginTimeout = Number(process.env.FASTIFY_PLUGIN_TIMEOUT_MS || 120_000);
  const app = Fastify({ logger: true, pluginTimeout });
  const allowedOrigins = parseAllowedOrigins();
  const isProduction = String(process.env.NODE_ENV || "").toLowerCase() === "production";
  const jwtSecretFromEnv = String(process.env.JWT_SECRET || "").trim();
  if (isProduction && !jwtSecretFromEnv) {
    throw new Error("JWT_SECRET é obrigatório em produção.");
  }
  const jwtSecret = jwtSecretFromEnv || "mak-gestao-dev-jwt-secret";

  // DELETE/GET sem corpo não deve falhar quando o client envia Content-Type: application/json.
  app.removeContentTypeParser("application/json");
  app.addContentTypeParser("application/json", { parseAs: "string" }, (request, body, done) => {
    const raw = body == null ? "" : String(body);
    if (!raw.trim()) {
      done(null, undefined);
      return;
    }
    try {
      done(null, JSON.parse(raw));
    } catch (error) {
      error.statusCode = 400;
      done(error, undefined);
    }
  });

  app.register(fastifyRateLimit, {
    max: Number(process.env.RATE_LIMIT_MAX || 240),
    timeWindow: "1 minute",
    allowList: ["127.0.0.1", "::1"],
  });

  app.register(fastifyJwt, {
    secret: jwtSecret,
  });

  app.decorate("authenticate", async function authenticate(request, reply) {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ message: "Não autenticado." });
    }
  });

  app.register(cors, {
    origin(origin, callback) {
      if (isOriginAllowed(origin, allowedOrigins)) return callback(null, true);
      return callback(new Error("Origin não permitida"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "X-Empresa-Id"],
  });
  app.register(fastifyCompress, {
    threshold: 1024,
    global: true,
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
    const statusCode = Number(error?.statusCode || 500);
    const isClientError = statusCode >= 400 && statusCode < 500;
    reply.status(statusCode).send({
      message: isClientError
        ? error.message || "Requisição inválida."
        : "Erro interno do servidor",
    });
  });

  app.register(registerRoutes);
  return app;
};

const runBlockingBootTasks = async (log) => {
  try {
    const { runBlockingDatabaseBoot } = await import("../scripts/runBlockingDatabaseBoot.js");
    const report = await runBlockingDatabaseBoot(log);
    log.info(`[boot-blocking] Concluído: ${JSON.stringify(report.summary ?? report.compatibility ?? report)}`);
  } catch (error) {
    log.error(`[boot-blocking] FATAL — servidor não iniciará: ${error.message}`);
    process.exit(1);
  }
};

const start = async () => {
  const app = buildServer();
  const host = resolveHost();
  const port = resolvePort();
  const backgroundBootDelayMs = Math.max(
    3_000,
    Number(process.env.BOOT_BACKGROUND_DELAY_MS) || 30_000
  );

  if (String(process.env.NODE_ENV || "").toLowerCase() === "production") {
    await runBlockingBootTasks(app.log);
  }

  try {
    await app.listen({ host, port });
    app.log.info(`Backend ativo em http://${host}:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }

  if (String(process.env.NODE_ENV || "").toLowerCase() === "production") {
    setTimeout(() => {
      app.log.info(`[boot] Iniciando tarefas de produção em background após ${backgroundBootDelayMs}ms.`);
      import("../scripts/productionBootTasks.js")
        .then(({ runProductionBootTasks }) => runProductionBootTasks(app.log))
        .then(() => app.log.info("[boot] Tarefas de produção em background concluídas."))
        .catch((error) => app.log.error(`[boot] Falha nas tarefas de produção: ${error.message}`));
    }, backgroundBootDelayMs);
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
