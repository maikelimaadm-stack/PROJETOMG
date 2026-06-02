import { empresaService } from "./services/empresaService.js";
import { assertRole, loadAccessScope } from "../auth/accessScope.js";
import {
  campoPersonalizadoSchema,
  campoUpdateSchema,
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

  app.get("/api/empresas/campos", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const items = await empresaService.listCampos(scope);
    return { items };
  });

  app.post("/api/empresas/campos", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    ensureMutationRole(scope);
    const payload = parseOrThrow(
      campoPersonalizadoSchema,
      request.body,
      "Payload inválido para criação de campo."
    );
    const item = await empresaService.createCampo(payload, scope);
    return reply.status(201).send({ item });
  });

  app.put("/api/empresas/campos/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    ensureMutationRole(scope);
    try {
      const payload = parseOrThrow(
        campoUpdateSchema,
        request.body,
        "Payload inválido para atualização de campo."
      );
      const item = await empresaService.updateCampo(request.params.id, payload, scope);
      if (!item) return reply.status(404).send({ message: "Campo não encontrado para atualização" });
      return { item };
    } catch (error) {
      if (error?.statusCode && error.statusCode !== 404) {
        return reply.status(error.statusCode).send({ message: error.message });
      }
      return reply.status(404).send({ message: "Campo não encontrado para atualização" });
    }
  });

  app.delete("/api/empresas/campos/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    ensureMutationRole(scope);
    try {
      const ok = await empresaService.removeCampo(request.params.id, scope);
      if (!ok) return reply.status(404).send({ message: "Campo não encontrado para exclusão" });
      return { ok: true };
    } catch (error) {
      if (error?.statusCode && error.statusCode !== 404) {
        return reply.status(error.statusCode).send({ message: error.message });
      }
      return reply.status(404).send({ message: "Campo não encontrado para exclusão" });
    }
  });

  app.post("/api/empresas/options", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const items = await empresaService.listOptionsSources(request.body?.sources || [], scope);
    return { items };
  });
};
