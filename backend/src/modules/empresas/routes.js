import { empresaService } from "./services/empresaService.js";
import { assertRole, loadAccessScope } from "../auth/accessScope.js";
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

  app.get("/api/empresas/campos", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const mode = String(request.query?.mode || "aplicavel").toLowerCase() === "config" ? "config" : "aplicavel";
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
    return reply.status(201).send({ item });
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
      return { ok: true };
    } catch (error) {
      if (error?.statusCode && error.statusCode !== 404) {
        return reply.status(error.statusCode).send({ message: error.message });
      }
      return reply.status(404).send({ message: "Empresa não encontrada para exclusão" });
    }
  });
};
