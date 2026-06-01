import { registerAuthRoutes } from "../modules/auth/routes.js";
import { registerEmpresasRoutes } from "../modules/empresas/routes.js";
import { registerAnexosRoutes } from "../modules/anexos/routes.js";
import { verifyDatabaseConnection } from "../database/prismaClient.js";
import { isSupabaseStorageConfigured, verifySupabaseStorageConnection } from "../integrations/supabase/adminClient.js";

export const registerRoutes = async (app) => {
  app.get("/api/health", async () => {
    const status = {
      service: "erp-backend",
      db: { configured: Boolean(process.env.DATABASE_URL), connected: false, error: null },
      supabase: {
        authConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
        storageConfigured: isSupabaseStorageConfigured,
        storageConnected: false,
        storageError: null,
      },
    };

    try {
      await verifyDatabaseConnection();
      status.db.connected = true;
    } catch (error) {
      status.db.error = error.message || "Falha na conexão com PostgreSQL";
    }

    if (status.supabase.storageConfigured) {
      const storage = await verifySupabaseStorageConnection();
      status.supabase.storageConnected = storage.connected;
      status.supabase.storageError = storage.error;
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
