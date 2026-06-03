import { repCps } from "./repCps.js";
import { toLegacyCampoList } from "./campoLegacyAdapter.js";

export const svcCps = {
  ensureTelasSeed: () => repCps.ensureTelasSeed(),
  listTelas: (scope) => repCps.listTelas(),
  list: (scope, query) => repCps.list({ scope, query }),
  get: (scope, id) => repCps.getById(scope, id),
  create: (scope, payload) => repCps.create({ scope, payload }),
  update: (scope, id, payload) => repCps.update({ scope, id, payload }),
  remove: (scope, id) => repCps.remove({ scope, id }),
  listHistorico: (scope, id) => repCps.listHistorico(scope, id),

  /** Campos aplicáveis a uma entity (ex.: EmpresaCadastro) — formato legado */
  async listApplicableLegacy(scope, entityName) {
    const items = await repCps.listApplicable(scope, entityName);
    return toLegacyCampoList(items);
  },
};
