import { assertRole, loadAccessScope } from "../auth/accessScope.js";
import { getContadores } from "./metricsService.js";
import { getHttpLatencySnapshot } from "../../observability/httpLatencyMetrics.js";

export const registerMetricsRoutes = async (app) => {
  app.get("/api/metrics/registros-globais", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const { registrosGlobais } = await getContadores(scope);
    return { total: registrosGlobais };
  });

  app.get("/api/metrics/contadores", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    assertRole(scope, ["ADMIN"]);
    return getContadores(scope);
  });

  app.get("/api/metrics/http-latency", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    assertRole(scope, ["ADMIN"]);
    return {
      generatedAt: new Date().toISOString(),
      routes: getHttpLatencySnapshot(),
    };
  });
};
