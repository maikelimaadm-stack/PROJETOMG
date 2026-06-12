import { empresaService } from "./services/empresaService.js";
import { assertRole, loadAccessScope } from "../auth/accessScope.js";
import { getContadores } from "../metrics/metricsService.js";
import {
  empresaCreateSchema,
  empresaUpdateSchema,
  parseOrThrow,
} from "./validators.js";

const ensureMutationRole = (scope) => assertRole(scope, ["ADMIN"]);

export const registerEmpresasRoutes = async (app) => {
  app.get("/api/empresas", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    let parsedFilters = {};
    if (request.query?.filters) {
      try {
        parsedFilters = JSON.parse(String(request.query.filters));
      } catch {
        parsedFilters = {};
      }
    }
    const result = await empresaService.list(
      { ...(request.query || {}), filters: parsedFilters },
      scope
    );
    return result;
  });

  app.get("/api/empresas/selector", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const result = await empresaService.list(
      {
        page: request.query?.page || 1,
        pageSize: Math.min(50, Number(request.query?.pageSize) || 20),
        search: request.query?.search || "",
        sortBy: "codempresa",
        sortDir: "asc",
      },
      scope
    );
    return {
      items: (result.items || []).map((item) => ({
        id: item.id,
        codempresa: item.codempresa,
        nome_empresa: item.razao_social,
      })),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    };
  });

  app.get("/api/empresas/campos", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const mode = String(request.query?.mode || "aplicavel").toLowerCase() === "config" ? "config" : "aplicavel";
    if (mode === "config") {
      return empresaService.listCamposPaginated(scope, request.query || {});
    }
    const items = await empresaService.listCampos(scope, mode);
    return { items };
  });

  app.post("/api/empresas/options", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const items = await empresaService.listOptionsSources(request.body?.sources || [], scope);
    return { items };
  });

  app.get("/api/empresas/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    const item = await empresaService.get(request.params.id, scope);
    if (!item) return reply.status(404).send({ message: "Empresa não encontrada" });
    return { item };
  });

  app.post("/api/empresas", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    ensureMutationRole(scope);
    const payload = parseOrThrow(
      empresaCreateSchema,
      request.body,
      "Payload inválido para cadastro de empresa."
    );
    const item = await empresaService.create(payload, scope);
    const contadores = await getContadores(scope);
    return reply.status(201).send({ item, contadores });
  });

  app.put("/api/empresas/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    ensureMutationRole(scope);
    try {
      const payload = parseOrThrow(
        empresaUpdateSchema,
        request.body,
        "Payload inválido para atualização de empresa."
      );
      const item = await empresaService.update(request.params.id, payload, scope);
      if (!item) return reply.status(404).send({ message: "Empresa não encontrada para atualização" });
      return { item };
    } catch (error) {
      if (error?.statusCode && error.statusCode !== 404) {
        return reply.status(error.statusCode).send({ message: error.message });
      }
      return reply.status(404).send({ message: "Empresa não encontrada para atualização" });
    }
  });

  app.delete("/api/empresas/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    ensureMutationRole(scope);
    try {
      const ok = await empresaService.remove(request.params.id, scope);
      if (!ok) return reply.status(404).send({ message: "Empresa não encontrada para exclusão" });
      const contadores = await getContadores(scope);
      return { ok: true, contadores };
    } catch (error) {
      if (error?.statusCode && error.statusCode !== 404) {
        return reply.status(error.statusCode).send({ message: error.message });
      }
      return reply.status(404).send({ message: "Empresa não encontrada para exclusão" });
    }
  });
};
