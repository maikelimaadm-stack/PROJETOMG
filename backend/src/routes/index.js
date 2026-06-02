import { registerAuthRoutes } from "../modules/auth/routes.js";
import { registerEmpresasRoutes } from "../modules/empresas/routes.js";
import { registerAnexosRoutes } from "../modules/anexos/routes.js";
import { verifyDatabaseConnection } from "../database/prismaClient.js";
import { isSupabaseStorageConfigured, verifySupabaseStorageConnection } from "../integrations/supabase/adminClient.js";

const withTimeout = async (operation, timeoutMs, timeoutMessage) => {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });
  return Promise.race([operation(), timeout]);
};

export const registerRoutes = async (app) => {
  app.get("/api/health", async () => {
    const status = {
      service: "erp-backend",
      db: { configured: Boolean(process.env.DATABASE_URL), connected: false, error: null },
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

    return {
      ok: status.db.connected,
      ...status,
    };
  });

  await registerAuthRoutes(app);
  await registerEmpresasRoutes(app);
  await registerAnexosRoutes(app);
};
