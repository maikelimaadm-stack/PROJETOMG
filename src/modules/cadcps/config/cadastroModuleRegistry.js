import registry from "../../../../config/cadastro-modules.registry.json";

const EXCLUDED_MODULE_IDS = new Set(["cadcps"]);

/** Telas disponíveis = módulos registrados e ativos (sem CADCPS, sem experimentais). */
export const listCadastroModulesForCadcps = () =>
  registry
    .filter((entry) => entry.ativo !== false && !EXCLUDED_MODULE_IDS.has(entry.moduleId))
    .sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999))
    .map((entry) => ({
      codigo: entry.codigo,
      nome: entry.nome,
      entity_name: entry.entityName,
      ordem: entry.ordem ?? 999,
      module_id: entry.moduleId,
    }));
