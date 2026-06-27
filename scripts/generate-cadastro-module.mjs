#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const requiredArgs = [
  "moduleId",
  "entityName",
  "singularLabel",
  "pluralLabel",
  "repository",
  "api",
  "schema",
];

const parseArgs = (argv) => {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
};

const toPascalCase = (value) =>
  String(value || "")
    .split(/[^a-zA-Z0-9]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

const replaceTokens = (value, replacements) => {
  let output = value;
  Object.entries(replacements).forEach(([token, replacement]) => {
    output = output.replaceAll(token, replacement);
  });
  return output;
};

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(fullPath);
      return [fullPath];
    })
  );
  return files.flat();
};

const generatedModulesRegistryPath = path.join(repoRoot, "src/modules/generatedModules.json");
const cadastroModulesRegistryPath = path.join(repoRoot, "config/cadastro-modules.registry.json");

const readJsonArray = async (filePath) => {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeJson = async (filePath, data) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
};

const updateGeneratedModulesRegistry = async ({ moduleId, moduleIdPascal, pluralLabel, pageCode }) => {
  const registry = await readJsonArray(generatedModulesRegistryPath);
  const nextEntry = {
    moduleId,
    routePath: `/Cadastro${moduleIdPascal}`,
    menuLabel: `Cadastro de ${pluralLabel}`,
    pageFile: `modules/${moduleId}/pages/${pageCode}.jsx`,
  };
  const nextRegistry = [...registry.filter((item) => item.moduleId !== moduleId), nextEntry].sort((a, b) =>
    a.menuLabel.localeCompare(b.menuLabel, "pt-BR", { sensitivity: "base" })
  );
  await writeJson(generatedModulesRegistryPath, nextRegistry);
};

const updateCadastroModulesRegistry = async ({
  moduleId,
  moduleIdPascal,
  pluralLabel,
  entityName,
  ordem,
}) => {
  const registry = await readJsonArray(cadastroModulesRegistryPath);
  const nextEntry = {
    moduleId,
    codigo: moduleIdPascal.toUpperCase(),
    nome: pluralLabel,
    entityName,
    ordem: Number(ordem) || (registry.length + 1) * 10,
    ativo: true,
  };
  const nextRegistry = [...registry.filter((item) => item.moduleId !== moduleId), nextEntry].sort(
    (a, b) => (a.ordem || 0) - (b.ordem || 0)
  );
  await writeJson(cadastroModulesRegistryPath, nextRegistry);
};

const resolveTargetPath = ({ contextName, scaffoldDir, targetRoot, relativeWithoutTpl, replacements }) => {
  const relative = replaceTokens(relativeWithoutTpl, replacements);

  if (contextName === "frontend") {
    if (relative.startsWith("apis/")) {
      const apiFile = path.basename(relative);
      return path.join(repoRoot, "src/apis", replacements.__MODULE_ID__, apiFile);
    }
    return path.join(targetRoot, relative);
  }

  return path.join(targetRoot, relative);
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const missing = requiredArgs.filter((key) => !args[key]);
  if (missing.length > 0) {
    console.error(`Parâmetros ausentes: ${missing.join(", ")}`);
    console.error(
      "Uso: node scripts/generate-cadastro-module.mjs --moduleId fazendas --entityName FazendaCadastro --singularLabel Fazenda --pluralLabel Fazendas --repository fazendaRepository --api FazendaApi --schema fazendaSchema [--keyPrefix faz] [--pageCode PAGFAZ] [--ordem 40] [--dry-run] [--force]"
    );
    process.exit(1);
  }

  const moduleId = String(args.moduleId).toLowerCase();
  if (!/^[a-z0-9-]+$/.test(moduleId)) {
    console.error("moduleId deve conter apenas letras minúsculas, números e hífen.");
    process.exit(1);
  }

  const moduleIdPascal = toPascalCase(moduleId);
  const keyPrefix = String(args.keyPrefix || moduleId.slice(0, 3)).toLowerCase();
  const keyPrefixUpper = keyPrefix.toUpperCase();
  const keyPrefixPascal = keyPrefix.charAt(0).toUpperCase() + keyPrefix.slice(1);
  const pageCode = String(args.pageCode || `PAG${keyPrefixUpper}`).toUpperCase();

  const replacements = {
    "__MODULE_ID__": moduleId,
    "__MODULE_ID_PASCAL__": moduleIdPascal,
    "__MODULE_ID_UPPER__": moduleId.toUpperCase().replace(/-/g, "_"),
    "__KEY_PREFIX__": keyPrefix,
    "__KEY_PREFIX_UPPER__": keyPrefixUpper,
    "__KEY_PREFIX_PASCAL__": keyPrefixPascal,
    "__PAGE_CODE__": pageCode,
    "__ENTITY_NAME__": String(args.entityName),
    "__SINGULAR_LABEL__": String(args.singularLabel),
    "__PLURAL_LABEL__": String(args.pluralLabel),
    "__REPOSITORY_NAME__": String(args.repository),
    "__API_NAME__": String(args.api),
    "__SCHEMA_NAME__": String(args.schema),
  };

  const frontendScaffoldDir = path.join(repoRoot, "src/modules/template/scaffold");
  const backendScaffoldDir = path.join(repoRoot, "src/modules/template/scaffold-backend");
  const targetModuleDir = path.join(repoRoot, "src/modules", moduleId);
  const backendRootDir = path.join(repoRoot, "backend");
  const targetBackendModuleDir = path.join(backendRootDir, "src/modules", moduleId);
  const dryRun = Boolean(args["dry-run"]);
  const force = Boolean(args.force);
  const frontendOnly = Boolean(args["frontend-only"]);
  const backendOnly = Boolean(args["backend-only"]);

  if (frontendOnly && backendOnly) {
    console.error("Use apenas uma opção: --frontend-only ou --backend-only.");
    process.exit(1);
  }

  const generationContexts = [];
  if (!backendOnly) {
    generationContexts.push({
      name: "frontend",
      scaffoldDir: frontendScaffoldDir,
      targetRoot: targetModuleDir,
    });
  }
  if (!frontendOnly) {
    generationContexts.push({
      name: "backend",
      scaffoldDir: backendScaffoldDir,
      targetRoot: backendRootDir,
    });
  }

  if (generationContexts.length === 0) {
    console.error("Nenhum contexto de geração selecionado.");
    process.exit(1);
  }

  for (const context of generationContexts) {
    try {
      await fs.access(context.scaffoldDir);
    } catch {
      console.error(`Scaffold não encontrado para ${context.name}: ${context.scaffoldDir}`);
      process.exit(1);
    }
  }

  if (!dryRun) {
    if (!backendOnly) {
      try {
        await fs.access(targetModuleDir);
        if (!force) {
          console.error(`Módulo frontend já existe: ${targetModuleDir}. Use --force para sobrescrever.`);
          process.exit(1);
        }
      } catch {
        // módulo ainda não existe
      }
    }

    if (!frontendOnly) {
      try {
        await fs.access(targetBackendModuleDir);
        if (!force) {
          console.error(
            `Módulo backend já existe: ${targetBackendModuleDir}. Use --force para sobrescrever.`
          );
          process.exit(1);
        }
      } catch {
        // módulo ainda não existe
      }
    }
  }

  const plannedFiles = [];

  for (const context of generationContexts) {
    const scaffoldFiles = await walk(context.scaffoldDir);
    if (scaffoldFiles.length === 0) {
      console.error(`Nenhum scaffold encontrado em ${context.scaffoldDir}.`);
      process.exit(1);
    }

    for (const scaffoldFile of scaffoldFiles) {
      const relative = path.relative(context.scaffoldDir, scaffoldFile);
      const relativeWithoutTpl = relative.replace(/\.tpl$/, "");
      const targetPath = resolveTargetPath({
        contextName: context.name,
        scaffoldDir: context.scaffoldDir,
        targetRoot: context.targetRoot,
        relativeWithoutTpl,
        replacements,
      });
      const rawContent = await fs.readFile(scaffoldFile, "utf8");
      const content = replaceTokens(rawContent, replacements);

      plannedFiles.push(targetPath);

      if (!dryRun) {
        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        await fs.writeFile(targetPath, content, "utf8");
      }
    }
  }

  if (!dryRun && !backendOnly) {
    await updateGeneratedModulesRegistry({
      moduleId,
      moduleIdPascal,
      pluralLabel: String(args.pluralLabel),
      pageCode,
    });
    plannedFiles.push(generatedModulesRegistryPath);

    await updateCadastroModulesRegistry({
      moduleId,
      moduleIdPascal,
      pluralLabel: String(args.pluralLabel),
      entityName: String(args.entityName),
      ordem: args.ordem,
    });
    plannedFiles.push(cadastroModulesRegistryPath);
  }

  console.log(dryRun ? "Dry-run do gerador concluído (ModeloBase1)." : "Módulo ModeloBase1 gerado com sucesso.");
  plannedFiles.forEach((file) => {
    console.log(` - ${path.relative(repoRoot, file)}`);
  });
};

main().catch((error) => {
  console.error(`Erro ao gerar módulo: ${error.message}`);
  process.exit(1);
});
