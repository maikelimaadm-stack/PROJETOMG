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
        const { getMissingSchemaItems } = await import("../../scripts/ensureSchema.js");
        const client = (await import("../database/prismaClient.js")).getPrismaClient();
        const missing = await getMissingSchemaItems(client);
        status.migration.restructureApplied = missing.length === 0;
        if (missing.length > 0) {
          status.migration.missingSchema = missing;
        }

        const [clientes, empresas, sequencias] = await Promise.all([
          client.cliente.count(),
          client.empresa.count(),
          client.entidadeCodigoSequencia.findMany({
            select: { cliente_id: true, entity_name: true, next_codigo: true },
            take: 20,
          }),
        ]);
        status.data = {
          clientes,
          empresas,
          sequencias,
          resetHint:
            clientes > 1 || empresas > 0
              ? "Dados antigos detectados. Rode resetAndSeedMaike.sql no Supabase OU defina BOOT_RESET_MAIKE=true no Railway (um deploy) e remova depois."
              : null,
        };

        try {
          const { PERFORMANCE_INDEX_NAMES } = await import("../../scripts/ensurePerformanceIndexes.js");
          const indexRows = await client.$queryRaw`
            SELECT indexname
            FROM pg_indexes
            WHERE schemaname = 'public'
              AND indexname = ANY(${PERFORMANCE_INDEX_NAMES})
          `;
          const foundNames = indexRows.map((row) => row.indexname);
          const missingIndexes = PERFORMANCE_INDEX_NAMES.filter((name) => !foundNames.includes(name));
          status.performanceIndexes = {
            expected: PERFORMANCE_INDEX_NAMES.length,
            found: foundNames.length,
            applied: missingIndexes.length === 0,
            missing: missingIndexes,
          };
        } catch (indexError) {
          status.performanceIndexes = {
            applied: false,
            error: indexError.message || "Falha ao consultar pg_indexes",
          };
        }
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
