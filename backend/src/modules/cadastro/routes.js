import { loadAccessScope } from "../auth/accessScope.js";
import { svcCps } from "../cadcps/svcCps.js";
import { empresaService } from "../empresas/services/empresaService.js";

const ENTITY_ALIASES = {
  empresas: "EmpresaCadastro",
  empresa: "EmpresaCadastro",
  empresacadastro: "EmpresaCadastro",
};

const resolveEntityName = (entityParam) => {
  const raw = String(entityParam || "").trim();
  if (!raw) {
    const error = new Error("Entidade de cadastro não informada.");
    error.statusCode = 400;
    throw error;
  }
  const alias = ENTITY_ALIASES[raw.toLowerCase()];
  if (alias) return alias;
  if (/^[a-z][a-z0-9_]*$/i.test(raw)) return raw;
  const error = new Error("Nome de entidade inválido.");
  error.statusCode = 400;
  throw error;
};

export const registerCadastroRoutes = async (app) => {
  app.get(
    "/api/cadastro/:entity/campos",
    { preHandler: app.authenticate },
    async (request) => {
      const scope = await loadAccessScope(request);
      const entityName = resolveEntityName(request.params.entity);
      const mode =
        String(request.query?.mode || "aplicavel").toLowerCase() === "config" ? "config" : "aplicavel";

      if (entityName === "EmpresaCadastro" && mode === "config") {
        const items = await empresaService.listCampos(scope, mode);
        return { items, entityName };
      }

      if (entityName === "EmpresaCadastro") {
        const items = await svcCps.listApplicableLegacy(scope, entityName);
        return { items, entityName };
      }

      const items = await svcCps.listApplicableLegacy(scope, entityName);
      return { items, entityName };
    }
  );

  app.post(
    "/api/cadastro/:entity/options",
    { preHandler: app.authenticate },
    async (request) => {
      const scope = await loadAccessScope(request);
      const entityName = resolveEntityName(request.params.entity);
      if (entityName === "EmpresaCadastro") {
        const items = await empresaService.listOptionsSources(request.body?.sources || [], scope);
        return { items, entityName };
      }
      return { items: {}, entityName };
    }
  );
};
