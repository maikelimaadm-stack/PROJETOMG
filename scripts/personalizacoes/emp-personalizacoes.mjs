#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const LOCAL_ROOT = path.join(ROOT, ".local/personalizacoes/empresas");
const TEMPLATE_ROOT = path.join(__dirname, "templates");
const FORM_CONSTANTS = path.join(ROOT, "src/modules/empresas/components/formEmp.constants.js");

const commands = new Set(["init", "status", "import", "apply-form-layout", "help"]);

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

const writeJson = (filePath, payload) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
};

const copyTemplate = (name, targetName = name) => {
  const source = path.join(TEMPLATE_ROOT, name);
  const target = path.join(LOCAL_ROOT, targetName);
  if (fs.existsSync(target)) return { copied: false, target };
  writeJson(target, readJson(source));
  return { copied: true, target };
};

const normalizeFormSnapshot = (payload) => {
  const config = payload?.config && typeof payload.config === "object" ? payload.config : payload;
  if (!config?.layout || typeof config.layout !== "object") {
    throw new Error("Snapshot inválido: campo config.layout ausente.");
  }
  return config;
};

const formatLayoutBlock = (layout) => {
  const entries = Object.entries(layout).map(([panelId, fieldIds]) => {
    const items = (fieldIds || []).map((fieldId) => `"${fieldId}"`).join(", ");
    return `  ${panelId}: [${items}],`;
  });
  return `export const EMP_FORM_DEFAULT_LAYOUT = {\n${entries.join("\n")}\n};`;
};

const replaceBlock = (source, pattern, replacement) => {
  if (!pattern.test(source)) {
    throw new Error("Bloco alvo não encontrado no arquivo de constants.");
  }
  return source.replace(pattern, replacement);
};

const applyFormLayoutToConstants = (config) => {
  let source = fs.readFileSync(FORM_CONSTANTS, "utf8");
  const layoutBlock = formatLayoutBlock(config.layout);
  source = replaceBlock(source, /export const EMP_FORM_DEFAULT_LAYOUT = \{[\s\S]*?\};/, layoutBlock);

  const fieldLayoutConfig = config.fieldLayoutConfig || { mode: "vertical", columns: 1 };
  source = replaceBlock(
    source,
    /fieldLayoutConfig: \{ mode: "[^"]+", columns: \d+ \}/,
    `fieldLayoutConfig: { mode: "${fieldLayoutConfig.mode || "vertical"}", columns: ${Number(fieldLayoutConfig.columns) || 1} }`
  );

  fs.writeFileSync(FORM_CONSTANTS, source, "utf8");
};

const printHelp = () => {
  console.log(`
Uso: node scripts/personalizacoes/emp-personalizacoes.mjs <comando>

Comandos:
  init                 Cria .local/personalizacoes/empresas/ com templates
  status               Mostra arquivos locais e diferenças básicas
  import <arquivo>     Valida e salva snapshot em .local/
  apply-form-layout    Aplica form-layout.snapshot.json nos defaults do código (para PR)
  help                 Mostra esta ajuda

Fluxo recomendado:
  1. cp .env.local.example .env.local
  2. npm run dev
  3. Ajuste layout/colunas na UI (Cadastro de Empresas)
  4. No console do navegador: window.__empPersonalizacoes.exportFormLayout()
  5. Mova o arquivo baixado para .local/personalizacoes/empresas/form-layout.snapshot.json
  6. npm run personalizacoes:import -- .local/personalizacoes/empresas/form-layout.snapshot.json
  7. Quando estiver pronto para PR: npm run personalizacoes:apply-form-layout
`);
};

const cmdInit = () => {
  fs.mkdirSync(LOCAL_ROOT, { recursive: true });
  const form = copyTemplate("form-layout.snapshot.template.json", "form-layout.snapshot.json");
  const table = copyTemplate("table-columns.template.json", "table-columns.json");
  console.log("Pasta local pronta:", LOCAL_ROOT);
  console.log(form.copied ? `Criado: ${form.target}` : `Já existia: ${form.target}`);
  console.log(table.copied ? `Criado: ${table.target}` : `Já existia: ${table.target}`);
  console.log("\nPróximo passo: cp .env.local.example .env.local && npm run dev");
};

const cmdStatus = () => {
  console.log("Raiz local:", LOCAL_ROOT);
  if (!fs.existsSync(LOCAL_ROOT)) {
    console.log("Status: pasta local ainda não criada. Rode: npm run personalizacoes:init");
    return;
  }
  const files = fs.readdirSync(LOCAL_ROOT).filter((name) => name.endsWith(".json"));
  if (files.length === 0) {
    console.log("Status: nenhum JSON local encontrado.");
    return;
  }
  files.forEach((fileName) => {
    const fullPath = path.join(LOCAL_ROOT, fileName);
    const payload = readJson(fullPath);
    const exportedAt = payload.exportedAt || "(sem exportedAt)";
    console.log(`- ${fileName} | exportedAt=${exportedAt}`);
  });
  const formPath = path.join(LOCAL_ROOT, "form-layout.snapshot.json");
  if (fs.existsSync(formPath)) {
    const config = normalizeFormSnapshot(readJson(formPath));
    const totalFields = Object.values(config.layout).flat().length;
    console.log(`\nLayout local: ${totalFields} campos posicionados`);
    console.log(`Modo de campos: ${config.fieldLayoutConfig?.mode || "vertical"}`);
  }
};

const cmdImport = (inputPath) => {
  if (!inputPath) throw new Error("Informe o caminho do arquivo JSON.");
  const absolute = path.resolve(process.cwd(), inputPath);
  if (!fs.existsSync(absolute)) throw new Error(`Arquivo não encontrado: ${absolute}`);
  const payload = readJson(absolute);
  if (payload.screen === "empresas.form_layout" || payload.config?.layout) {
    normalizeFormSnapshot(payload);
    const target = path.join(LOCAL_ROOT, "form-layout.snapshot.json");
    writeJson(target, payload);
    console.log("Importado com sucesso:", target);
    return;
  }
  if (payload.screen === "empresas.table_columns") {
    const target = path.join(LOCAL_ROOT, "table-columns.json");
    writeJson(target, payload);
    console.log("Importado com sucesso:", target);
    return;
  }
  throw new Error("Tipo de snapshot não reconhecido.");
};

const cmdApplyFormLayout = () => {
  const formPath = path.join(LOCAL_ROOT, "form-layout.snapshot.json");
  if (!fs.existsSync(formPath)) {
    throw new Error(`Arquivo não encontrado: ${formPath}. Exporte/importe o layout antes.`);
  }
  const config = normalizeFormSnapshot(readJson(formPath));
  applyFormLayoutToConstants(config);
  console.log("Defaults atualizados em:", FORM_CONSTANTS);
  console.log("Revise o diff e inclua no PR quando estiver satisfeito.");
};

const [command = "help", ...rest] = process.argv.slice(2);
if (!commands.has(command)) {
  console.error(`Comando inválido: ${command}`);
  printHelp();
  process.exit(1);
}

try {
  if (command === "help") printHelp();
  if (command === "init") cmdInit();
  if (command === "status") cmdStatus();
  if (command === "import") cmdImport(rest[0]);
  if (command === "apply-form-layout") cmdApplyFormLayout();
} catch (error) {
  console.error(`Erro: ${error.message}`);
  process.exit(1);
}
