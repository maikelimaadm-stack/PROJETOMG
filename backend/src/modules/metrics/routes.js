import { loadAccessScope } from "../auth/accessScope.js";
import { getContadores } from "./metricsService.js";

export const registerMetricsRoutes = async (app) => {
  app.get("/api/metrics/registros-globais", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const { registrosGlobais } = await getContadores(scope);
    return { total: registrosGlobais };
  });

  app.get("/api/metrics/contadores", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    return getContadores(scope);
  });
};
