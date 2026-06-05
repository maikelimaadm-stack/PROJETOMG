import { loadAccessScope, assertRole } from "../auth/accessScope.js";
import { clienteModuloService } from "./clienteModuloService.js";

const ensureAdmin = (scope) => assertRole(scope, ["ADMIN"]);

export const registerClienteModuloRoutes = async (app) => {
  app.get("/api/cliente-modulos", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const items = await clienteModuloService.list(scope);
    return { items };
  });

  app.put("/api/cliente-modulos/:modulo", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    ensureAdmin(scope);
    const ativo = Boolean(request.body?.ativo);
    const item = await clienteModuloService.updateModulo(scope, request.params.modulo, ativo);
    return reply.send({ item });
  });
};
