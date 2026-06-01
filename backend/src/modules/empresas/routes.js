import { empresaService } from "./services/empresaService.js";

export const registerEmpresasRoutes = async (app) => {
  app.get("/api/empresas", async () => {
    const items = await empresaService.list();
    return { items };
  });

  app.get("/api/empresas/:id", async (request, reply) => {
    const item = await empresaService.get(request.params.id);
    if (!item) return reply.status(404).send({ message: "Empresa não encontrada" });
    return { item };
  });

  app.post("/api/empresas", async (request, reply) => {
    const item = await empresaService.create(request.body || {});
    return reply.status(201).send({ item });
  });

  app.put("/api/empresas/:id", async (request, reply) => {
    try {
      const item = await empresaService.update(request.params.id, request.body || {});
      return { item };
    } catch {
      return reply.status(404).send({ message: "Empresa não encontrada para atualização" });
    }
  });

  app.delete("/api/empresas/:id", async (request, reply) => {
    try {
      await empresaService.remove(request.params.id);
      return { ok: true };
    } catch {
      return reply.status(404).send({ message: "Empresa não encontrada para exclusão" });
    }
  });

  app.get("/api/empresas/campos", async () => {
    const items = await empresaService.listCampos();
    return { items };
  });

  app.post("/api/empresas/campos", async (request, reply) => {
    const item = await empresaService.createCampo(request.body || {});
    return reply.status(201).send({ item });
  });

  app.put("/api/empresas/campos/:id", async (request, reply) => {
    try {
      const item = await empresaService.updateCampo(request.params.id, request.body || {});
      return { item };
    } catch {
      return reply.status(404).send({ message: "Campo não encontrado para atualização" });
    }
  });

  app.delete("/api/empresas/campos/:id", async (request, reply) => {
    try {
      await empresaService.removeCampo(request.params.id);
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
