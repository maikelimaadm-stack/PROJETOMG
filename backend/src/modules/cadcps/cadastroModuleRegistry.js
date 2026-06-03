import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const registryPath = path.resolve(__dirname, "../../../../config/cadastro-modules.registry.json");

const EXCLUDED_MODULE_IDS = new Set(["cadcps"]);

let cachedRegistry = null;

const loadRegistryFile = () => {
  if (cachedRegistry) return cachedRegistry;
  const raw = fs.readFileSync(registryPath, "utf8");
  const parsed = JSON.parse(raw);
  cachedRegistry = Array.isArray(parsed) ? parsed : [];
  return cachedRegistry;
};

/** Telas oficiais = módulos de cadastro registrados, ativos e implementados (exclui CADCPS). */
export const listCadastroModulesForCadcps = () =>
  loadRegistryFile()
    .filter((entry) => entry.ativo !== false && !EXCLUDED_MODULE_IDS.has(entry.moduleId))
    .sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999))
    .map((entry) => ({
      codigo: entry.codigo,
      nome: entry.nome,
      entity_name: entry.entityName,
      ordem: entry.ordem ?? 999,
      module_id: entry.moduleId,
    }));

export const registryEntityNames = () =>
  listCadastroModulesForCadcps().map((entry) => entry.entity_name);
