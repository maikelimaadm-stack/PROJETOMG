#!/usr/bin/env node
/**
 * Gates G207–G217 — Validation Configuration Engine V16 (Enterprise V15.9).
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
  "G207 — Validation Config Engine foundation",
  exists(path.join(MAK, "validation/createMakValidationConfigEngine.js"))
);

gate(
  "G208 — ModeloBase1/validationConfig re-exporta foundation",
  read(path.join(MB1, "validationConfig/index.js")).includes("createMakValidationConfigEngine") &&
    read(path.join(MB1, "validators/index.js")).includes("validationConfig")
);

gate(
  "G209 — runMakFormValidation integrado MakCadastroForm",
  read(path.join(ROOT, "src/framework/mak/form/MakCadastroForm.jsx")).includes("runMakFormValidation")
);

gate(
  "G210 — Metadata validation declarativa",
  read(path.join(MAK, "validation/buildMakValidationConfigMetadata.js")).includes("MAK_VALIDATION_METADATA_KEYS")
);

gate(
  "G211 — Bootstrap registra validation engine",
  read(path.join(ROOT, "src/modules/makBootstrap/registerMakPreferencesBootstrapModules.js")).includes(
    "registerMakValidationConfigEngine"
  )
);

const bootstrap = read(path.join(ROOT, "src/modules/makBootstrap/registerMakValidationConfigEngine.js"));
gate(
  "G212 — Módulos certificados + validationcert registrados",
  ["empresas", "produtos", "marcas", "cadcps", "validationcert"].every(
    (id) => bootstrap.includes(`"${id}"`) || bootstrap.includes(`${id}Schema`) || bootstrap.includes("validationcert")
  )
);

const catalog = read(path.join(MAK, "validation/validationCertificationCatalog.js"));
const rules = read(path.join(MAK, "validation/makValidationBuiltinRules.js"));
const requiredTypes = ["required", "email", "url", "regex", "cep", "cpf_cnpj", "tel", "min", "max", "mask"];
gate(
  "G213 — Catálogo certificação cobre tipos de validação",
  requiredTypes.every((type) => catalog.includes(type) && rules.includes(type))
);

gate(
  "G214 — Módulo fictício validationcert metadata-only",
  exists(path.join(ROOT, "src/modules/validationcert/config/validationCertModuleMetadata.js")) &&
    read(path.join(ROOT, "src/modules/validationcert/config/validationCertModuleMetadata.js")).includes(
      "MAK_VALIDATION_CERTIFICATION_CATALOG"
    )
);

gate(
  "G215 — Factory ModeloBase1 embeds validationEngine metadata",
  read(path.join(MB1, "config/buildModeloBase1ConfigFromMakModule.js")).includes("validationEngineMetadata")
);

gate(
  "G216 — Sem Validation Engine paralela no ModeloBase1",
  !exists(path.join(MB1, "validationConfig/ValidationRenderer.jsx")) &&
    !exists(path.join(MB1, "validationConfig/MakValidationForm.jsx"))
);

gate(
  "G217 — Build produção",
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
console.log(`\nG207-G217: ${results.length - failed.length}/${results.length} gates passed`);
if (failed.length) {
  process.exit(1);
}
