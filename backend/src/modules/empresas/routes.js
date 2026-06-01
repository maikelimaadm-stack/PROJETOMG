import { empresaService } from "./services/empresaService.js";

const getTenantId = (request) => {
  const headerTenant = request.headers["x-tenant-id"];
  if (headerTenant && String(headerTenant).trim()) return String(headerTenant).trim();
  return "default";
};

export const registerEmpresasRoutes = async (app) => {
  app.get("/api/empresas", async (request) => {
    const tenantId = getTenantId(request);
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
      tenantId
    );
    return result;
  });

  app.get("/api/empresas/:id", async (request, reply) => {
    const tenantId = getTenantId(request);
    const item = await empresaService.get(request.params.id, tenantId);
    if (!item) return reply.status(404).send({ message: "Empresa não encontrada" });
    return { item };
  });

  app.post("/api/empresas", async (request, reply) => {
    const tenantId = getTenantId(request);
    const item = await empresaService.create(request.body || {}, tenantId);
    return reply.status(201).send({ item });
  });

  app.put("/api/empresas/:id", async (request, reply) => {
    const tenantId = getTenantId(request);
    try {
      const item = await empresaService.update(request.params.id, request.body || {}, tenantId);
      if (!item) return reply.status(404).send({ message: "Empresa não encontrada para atualização" });
      return { item };
    } catch {
      return reply.status(404).send({ message: "Empresa não encontrada para atualização" });
    }
  });

  app.delete("/api/empresas/:id", async (request, reply) => {
    const tenantId = getTenantId(request);
    try {
      const ok = await empresaService.remove(request.params.id, tenantId);
      if (!ok) return reply.status(404).send({ message: "Empresa não encontrada para exclusão" });
      return { ok: true };
    } catch {
      return reply.status(404).send({ message: "Empresa não encontrada para exclusão" });
    }
  });

  app.get("/api/empresas/campos", async (request) => {
    const tenantId = getTenantId(request);
    const items = await empresaService.listCampos(tenantId);
    return { items };
  });

  app.post("/api/empresas/campos", async (request, reply) => {
    const tenantId = getTenantId(request);
    const item = await empresaService.createCampo(request.body || {}, tenantId);
    return reply.status(201).send({ item });
  });

  app.put("/api/empresas/campos/:id", async (request, reply) => {
    const tenantId = getTenantId(request);
    try {
      const item = await empresaService.updateCampo(request.params.id, request.body || {}, tenantId);
      if (!item) return reply.status(404).send({ message: "Campo não encontrado para atualização" });
      return { item };
    } catch {
      return reply.status(404).send({ message: "Campo não encontrado para atualização" });
    }
  });

  app.delete("/api/empresas/campos/:id", async (request, reply) => {
    const tenantId = getTenantId(request);
    try {
      const ok = await empresaService.removeCampo(request.params.id, tenantId);
      if (!ok) return reply.status(404).send({ message: "Campo não encontrado para exclusão" });
      return { ok: true };
    } catch {
      return reply.status(404).send({ message: "Campo não encontrado para exclusão" });
    }
  });

  app.post("/api/empresas/options", async (request) => {
    const items = await empresaService.listOptionsSources(request.body?.sources || []);
    return { items };
  });
};
