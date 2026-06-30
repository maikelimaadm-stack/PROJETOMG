import dotenv from "dotenv";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import fastifyJwt from "@fastify/jwt";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyCompress from "@fastify/compress";
import fastifyHelmet from "@fastify/helmet";
import { registerRoutes } from "./routes/index.js";
import { closePrismaClient } from "./database/prismaClient.js";
import { validateRuntimeEnv } from "./config/env.js";
import { recordHttpLatency } from "./observability/httpLatencyMetrics.js";
import { isAuthTokenRevoked } from "./modules/auth/tokenDenylist.js";

dotenv.config();
try {
  validateRuntimeEnv();
} catch (error) {
  // In cloud deploys we prefer a degraded boot + health diagnostics over crash loops (502).
  // Missing envs will surface in /api/health and failing routes as needed.
  console.warn(`[env] ${error.message}`);
}

const parseAllowedOrigins = () =>
  [
    ...String(process.env.FRONTEND_ORIGINS || "").split(","),
    String(process.env.FRONTEND_URL || ""),
    String(process.env.VITE_FRONTEND_URL || ""),
    String(process.env.VERCEL_PROJECT_PRODUCTION_URL || ""),
    String(process.env.VERCEL_URL || ""),
    // Defaults do projeto para não quebrar login em preview/deploy.
    "https://projetomg.vercel.app",
    "https://projetomg-*.vercel.app",
    "https://projetomg-git-*.vercel.app",
  ]
    .map((item) => item.trim().replaceAll('"', "").replaceAll("'", ""))
    .filter(Boolean)
    .map((item) => {
      if (/^https?:\/\//i.test(item)) return item;
      if (item.includes(".")) return `https://${item}`;
      return item;
    });

const normalizeOrigin = (origin = "") => String(origin).trim().replace(/\/+$/, "");

const isWildcardEntry = (entry = "") => entry.includes("*");

const matchWildcardOrigin = (origin, pattern) => {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`, "i").test(origin);
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

  return false;
};

const readCookieToken = (cookieHeader) => {
  if (!cookieHeader) return null;
  const match = String(cookieHeader)
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("erp_auth_token="));
  if (!match) return null;
  const [, rawValue] = match.split("=");
  if (!rawValue) return null;
  try {
    return decodeURIComponent(rawValue).trim() || null;
  } catch {
    return String(rawValue).trim() || null;
  }
};

const readBearerToken = (authorizationHeader) => {
  const value = String(authorizationHeader || "").trim();
  if (!value.toLowerCase().startsWith("bearer ")) return null;
  const token = value.slice(7).trim();
  return token || null;
};

const isMutationMethod = (method = "") =>
  ["POST", "PUT", "PATCH", "DELETE"].includes(String(method).toUpperCase());

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

const createRateLimitRedisClient = async (app) => {
  const redisUrl = String(process.env.REDIS_URL || "").trim();
  if (!redisUrl) return null;
  try {
    const { default: Redis } = await import("ioredis");
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
      lazyConnect: true,
      connectTimeout: 2_000,
    });
    await client.connect();
    app.addHook("onClose", async () => {
      try {
        await client.quit();
      } catch {
        /* ignore */
      }
    });
    app.log.info("[rate-limit] Redis distribuído habilitado.");
    return client;
  } catch (error) {
    app.log.warn(
      { err: error },
      "[rate-limit] Redis indisponível, fallback para memória local."
    );
    return null;
  }
};

const buildServer = async () => {
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

  const rateLimitRedisClient = await createRateLimitRedisClient(app);
  app.register(fastifyRateLimit, {
    max: Number(process.env.RATE_LIMIT_MAX || 240),
    timeWindow: "1 minute",
    allowList: ["127.0.0.1", "::1"],
    ...(rateLimitRedisClient
      ? {
          redis: rateLimitRedisClient,
          nameSpace: String(process.env.RATE_LIMIT_NAMESPACE || "mak-gestao:rate-limit"),
        }
      : {}),
  });

  app.register(fastifyJwt, {
    secret: jwtSecret,
  });

  app.decorate("authenticate", async function authenticate(request, reply) {
    try {
      const hasAuthorization = Boolean(request.headers.authorization);
      let authTokenRaw = readBearerToken(request.headers.authorization);
      let usedCookieToken = false;
      if (!authTokenRaw) {
        const cookieToken = readCookieToken(request.headers.cookie);
        if (cookieToken) {
          authTokenRaw = cookieToken;
          usedCookieToken = true;
          request.headers.authorization = `Bearer ${cookieToken}`;
        }
      }
      await request.jwtVerify();
      if (
        await isAuthTokenRevoked({
          token: authTokenRaw,
          jti: request.user?.jti || null,
        })
      ) {
        return reply.status(401).send({ message: "Sessão expirada." });
      }
      request.authTokenRaw = authTokenRaw;
      if (usedCookieToken && !hasAuthorization && isMutationMethod(request.method)) {
        const origin = request.headers.origin;
        if (!origin || !isOriginAllowed(origin, allowedOrigins)) {
          return reply.status(403).send({ message: "Origin inválida para operação autenticada por cookie." });
        }
      }
    } catch {
      return reply.status(401).send({ message: "Não autenticado." });
    }
  });

  app.register(cors, {
    origin(origin, callback) {
      if (isOriginAllowed(origin, allowedOrigins)) return callback(null, true);
      if (origin) {
        app.log.warn({ origin }, "Origin bloqueada por CORS");
      }
      return callback(new Error("Origin não permitida"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "X-Empresa-Id"],
  });
  app.register(fastifyHelmet, {
    global: true,
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });
  app.register(fastifyCompress, {
    threshold: 1024,
    global: true,
  });
  app.register(multipart, {
    limits: {
      fileSize: Math.max(1024, Number(process.env.MAX_UPLOAD_BYTES || 20 * 1024 * 1024)),
      files: 1,
      fields: 30,
    },
  });

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

  app.addHook("onRequest", async (request) => {
    request.__startAtMs = performance.now();
  });

  app.addHook("onResponse", async (request, reply) => {
    const startedAt = Number(request.__startAtMs || 0);
    if (!Number.isFinite(startedAt) || startedAt <= 0) return;
    const durationMs = performance.now() - startedAt;
    const route = request.routeOptions?.url || request.routerPath || request.url;
    recordHttpLatency({
      method: request.method,
      route,
      durationMs,
      statusCode: reply.statusCode,
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
  const app = await buildServer();
  const host = resolveHost();
  const port = resolvePort();
  const backgroundBootDelayMs = Math.max(
    3_000,
    Number(process.env.BOOT_BACKGROUND_DELAY_MS) || 30_000
  );
  const runBackgroundBootTasks =
    String(process.env.BOOT_RUN_BACKGROUND_TASKS || "").toLowerCase() === "true";

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
    if (runBackgroundBootTasks) {
      setTimeout(() => {
        app.log.info(
          `[boot] Iniciando tarefas de produção em background após ${backgroundBootDelayMs}ms.`
        );
        import("../scripts/productionBootTasks.js")
          .then(({ runProductionBootTasks }) => runProductionBootTasks(app.log))
          .then(() => app.log.info("[boot] Tarefas de produção em background concluídas."))
          .catch((error) => app.log.error(`[boot] Falha nas tarefas de produção: ${error.message}`));
      }, backgroundBootDelayMs);
    } else {
      app.log.info(
        "[boot] Tarefas de produção em background desativadas (BOOT_RUN_BACKGROUND_TASKS=false)."
      );
    }
  }

  const shutdown = async () => {
    await closePrismaClient();
    await app.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

export { buildServer, runBlockingBootTasks, start };

const isMainModule =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMainModule) {
  start();
}
