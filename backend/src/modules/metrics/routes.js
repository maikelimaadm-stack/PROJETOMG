import { loadAccessScope } from "../auth/accessScope.js";
import { countRegistrosGlobais } from "../idGlobal/idGlobalService.js";
import { empresaRepository } from "../empresas/repositories/empresaRepository.js";

export const registerMetricsRoutes = async (app) => {
  app.get("/api/metrics/registros-globais", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const total = await countRegistrosGlobais(scope.clienteId);
    return { total };
  });

  app.get("/api/metrics/contadores", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const [empresas, registrosGlobais] = await Promise.all([
      empresaRepository.count(scope),
      countRegistrosGlobais(scope.clienteId),
    ]);
    return { empresas, registrosGlobais };
  });
};
