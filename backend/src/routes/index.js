import { registerAuthRoutes } from "../modules/auth/routes.js";
import { registerEmpresasRoutes } from "../modules/empresas/routes.js";
import { registerAnexosRoutes } from "../modules/anexos/routes.js";

export const registerRoutes = async (app) => {
  app.get("/api/health", async () => ({ ok: true, service: "erp-backend" }));

  await registerAuthRoutes(app);
  await registerEmpresasRoutes(app);
  await registerAnexosRoutes(app);
};
