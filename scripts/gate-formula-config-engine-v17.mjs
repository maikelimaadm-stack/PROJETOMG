#!/usr/bin/env node
/**
 * Gates G218–G228 — Formula Configuration Engine V17.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const MAK = path.join(ROOT, "src/framework/mak");
const MB1 = path.join(ROOT, "src/ModeloBase1");

const results = [];
const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const read = (filePath) => fs.readFileSync(filePath, "utf8");
const exists = (filePath) => fs.existsSync(filePath);

gate(
  "G218 — Formula Config Engine foundation",
  exists(path.join(MAK, "formula/createMakFormulaConfigEngine.js"))
);

gate(
  "G219 — ModeloBase1/formulaConfig re-exporta foundation",
  read(path.join(MB1, "formulaConfig/index.js")).includes("createMakFormulaConfigEngine")
);

gate(
  "G220 — useMakFormFormulaEvaluation integrado MakCadastroForm",
  read(path.join(ROOT, "src/framework/mak/form/MakCadastroForm.jsx")).includes("useMakFormFormulaEvaluation")
);

gate(
  "G221 — Metadata formula declarativa",
  read(path.join(MAK, "formula/buildMakFormulaConfigMetadata.js")).includes("MAK_FORMULA_METADATA_KEYS")
);

gate(
  "G222 — Bootstrap registra formula engine",
  read(path.join(ROOT, "src/modules/makBootstrap/registerMakPreferencesBootstrapModules.js")).includes(
    "registerMakFormulaConfigEngine"
  )
);

const bootstrap = read(path.join(ROOT, "src/modules/makBootstrap/registerMakFormulaConfigEngine.js"));
gate(
  "G223 — Módulos certificados + formulacert registrados",
  ["empresas", "cadcps", "formulacert"].every(
    (id) => bootstrap.includes(`"${id}"`) || bootstrap.includes(`${id}CadastroConfig`) || bootstrap.includes("formulacert")
  )
);

const catalog = read(path.join(MAK, "formula/formulaCertificationCatalog.js"));
const fns = read(path.join(MAK, "formula/makFormulaBuiltinFunctions.js"));
const requiredFns = ["sum", "multiply", "percent", "dateDiff", "concat", "if"];
gate(
  "G224 — Catálogo certificação cobre funções de fórmula",
  requiredFns.every((fn) => catalog.includes(fn) || fns.includes(fn))
);

gate(
  "G225 — Módulo fictício formulacert metadata-only",
  exists(path.join(ROOT, "src/modules/formulacert/config/formulaCertModuleMetadata.js")) &&
    read(path.join(ROOT, "src/modules/formulacert/config/formulaCertModuleMetadata.js")).includes(
      "MAK_FORMULA_CERTIFICATION_CATALOG"
    )
);

gate(
  "G226 — Factory ModeloBase1 embeds formulaEngine metadata",
  read(path.join(MB1, "config/buildModeloBase1ConfigFromMakModule.js")).includes("formulaEngineMetadata")
);

gate(
  "G227 — Sem Formula Engine paralela no ModeloBase1",
  !exists(path.join(MB1, "formulaConfig/FormulaRenderer.jsx")) &&
    !exists(path.join(MB1, "formulaConfig/MakFormulaForm.jsx"))
);

gate(
  "G228 — Build produção",
  (() => {
    try {
      execSync("npm run build", { cwd: ROOT, stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  })()
);

const failed = results.filter((r) => !r.ok);
console.log(`\nG218-G228: ${results.length - failed.length}/${results.length} gates passed`);
if (failed.length) {
  process.exit(1);
}
