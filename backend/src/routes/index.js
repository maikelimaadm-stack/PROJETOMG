import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { registerAuthRoutes } from "../modules/auth/routes.js";
import { registerEmpresasRoutes } from "../modules/empresas/routes.js";
import { registerAnexosRoutes } from "../modules/anexos/routes.js";
import { registerPreferencesRoutes } from "../modules/preferences/routes.js";
import { registerCadcpsRoutes } from "../modules/cadcps/routes.js";
import { registerCadastroRoutes } from "../modules/cadastro/routes.js";
import { registerMetricsRoutes } from "../modules/metrics/routes.js";
import { registerClienteModuloRoutes } from "../modules/clienteModulo/routes.js";
import { verifyDatabaseConnection } from "../database/prismaClient.js";
import { isSupabaseStorageConfigured, verifySupabaseStorageConnection } from "../integrations/supabase/adminClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modulesDir = path.resolve(__dirname, "..", "modules");
const coreModules = new Set([
  "auth",
  "empresas",
  "anexos",
  "audit",
  "cadcps",
  "cadastro",
  "clienteModulo",
  "metrics",
  "preferences",
  "idGlobal",
  "sequencias",
]);

const withTimeout = async (operation, timeoutMs, timeoutMessage) => {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });
  return Promise.race([operation(), timeout]);
};

const registerGeneratedModuleRoutes = async (app) => {
  const entries = await fs.readdir(modulesDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const moduleId = entry.name;
    if (coreModules.has(moduleId)) continue;

    const routesPath = path.join(modulesDir, moduleId, "routes.js");
    try {
      await fs.access(routesPath);
    } catch {
      continue;
    }

    const loadedModule = await import(pathToFileURL(routesPath).href);
    const registerModuleRoutes = loadedModule.registerModuleRoutes;
    if (typeof registerModuleRoutes === "function") {
      await registerModuleRoutes(app);
      app.log.info(`Rotas do módulo '${moduleId}' registradas automaticamente.`);
    }
  }
};

export const registerRoutes = async (app) => {
  app.get("/", async () => ({
    ok: true,
    service: "erp-backend",
    message: "API do ERP em execução. Este endereço é o backend — abra o frontend no Vercel para usar o sistema.",
    frontend: process.env.FRONTEND_URL || "https://projetomg.vercel.app",
    health: "/api/health",
    docs: "Use /api/health para verificar banco, auth e storage.",
  }));

  app.get("/api/health", async () => {
    const status = {
      service: "erp-backend",
      db: { configured: Boolean(process.env.DATABASE_URL), connected: false, error: null },
      migration: { restructureApplied: null, directUrlConfigured: Boolean(process.env.DIRECT_URL) },
      auth: {
        jwtConfigured: Boolean(process.env.JWT_SECRET),
      },
      supabase: {
        authConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
        storageConfigured: isSupabaseStorageConfigured,
        storageConnected: false,
        storageError: null,
      },
    };

    try {
      await withTimeout(
        () => verifyDatabaseConnection(),
        3000,
        "Timeout ao verificar conexão com PostgreSQL"
      );
      status.db.connected = true;
      try {
        const client = (await import("../database/prismaClient.js")).getPrismaClient();
        const rows = await client.$queryRaw`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'Cliente' AND column_name = 'next_id_global'
          ) AS ok
        `;
        status.migration.restructureApplied = Boolean(rows[0]?.ok);
      } catch {
        status.migration.restructureApplied = false;
      }
    } catch (error) {
      status.db.error = error.message || "Falha na conexão com PostgreSQL";
    }

    if (status.supabase.storageConfigured) {
      try {
        const storage = await withTimeout(
          () => verifySupabaseStorageConnection(),
          3000,
          "Timeout ao verificar conexão com Supabase Storage"
        );
        status.supabase.storageConnected = storage.connected;
        status.supabase.storageError = storage.error;
      } catch (error) {
        status.supabase.storageConnected = false;
        status.supabase.storageError = error.message || "Falha na conexão com Supabase Storage";
      }
    }

    // Railway healthcheck: sempre HTTP 200 se o processo está vivo
    return {
      ok: true,
      alive: true,
      ready: status.db.connected,
      ...status,
    };
  });

  await Promise.all([
    registerAuthRoutes(app),
    registerPreferencesRoutes(app),
    registerCadcpsRoutes(app),
    registerEmpresasRoutes(app),
    registerAnexosRoutes(app),
    registerMetricsRoutes(app),
    registerClienteModuloRoutes(app),
    registerCadastroRoutes(app),
  ]);
  await registerGeneratedModuleRoutes(app);
};
