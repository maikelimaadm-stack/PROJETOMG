import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const registryCandidates = [
  path.resolve(__dirname, "../../../config/cadastro-modules.registry.json"),
  path.resolve(__dirname, "../../../../config/cadastro-modules.registry.json"),
];

const EXCLUDED_MODULE_IDS = new Set(["cadcps"]);

const FALLBACK_REGISTRY = [
  {
    moduleId: "empresas",
    codigo: "EMPRESAS",
    nome: "Empresas",
    entityName: "EmpresaCadastro",
    ordem: 10,
    ativo: true,
  },
];

let cachedRegistry = null;

const loadRegistryFile = () => {
  if (cachedRegistry) return cachedRegistry;
  for (const registryPath of registryCandidates) {
    try {
      const raw = fs.readFileSync(registryPath, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        cachedRegistry = parsed;
        return cachedRegistry;
      }
    } catch {
      // tenta próximo caminho
    }
  }
  console.warn("[cadcps] Registry não encontrado — usando fallback embutido.");
  cachedRegistry = FALLBACK_REGISTRY;
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
