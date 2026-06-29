#!/usr/bin/env node
/**
 * Gates G166–G175 — Field Configuration Engine V14 (ModeloBase1 Capability Pack V2).
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
  "G166 — Field Config Engine foundation",
  exists(path.join(MAK, "fieldConfig/createMakFieldConfigEngine.js"))
);

const mb1Field = read(path.join(MB1, "fieldConfig/index.js"));
gate(
  "G167 — ModeloBase1/fieldConfig re-exporta foundation",
  mb1Field.includes("RenderEngine") && mb1Field.includes("FieldEngine")
);

gate(
  "G168 — RenderEngine é re-export EmpDynamicFormRenderer (não duplicado)",
  read(path.join(ROOT, "src/framework/cadastro-engine/render/RenderEngine.jsx")).includes(
    "EmpDynamicFormRenderer"
  ) && !exists(path.join(MB1, "fieldConfig/RenderEngine.jsx"))
);

gate(
  "G169 — buildMakFieldConfigMetadata declarativo",
  read(path.join(MAK, "fieldConfig/buildMakFieldConfigMetadata.js")).includes("MAK_FIELD_METADATA_KEYS")
);

const prefsBootstrap = read(path.join(ROOT, "src/modules/makBootstrap/registerMakPreferencesBootstrapModules.js"));
gate(
  "G170 — Bootstrap registra field engine",
  prefsBootstrap.includes("registerMakFieldConfigEngine") ||
    prefsBootstrap.includes("registerRuntimeBridge")
);

const registry = read(path.join(ROOT, "src/modules/makBootstrap/registerMakFieldConfigEngine.js"));
gate(
  "G171 — Módulos certificados + fieldcert registrados",
  ["empresas", "cadcps", "fieldcert"].every((id) =>
    registry.includes(`"${id}"`) || registry.includes(`${id}CadastroConfig`) || registry.includes("fieldcert")
  )
);

const catalog = read(path.join(MAK, "fieldConfig/fieldCertificationCatalog.js"));
const builtin = read(path.join(ROOT, "src/framework/cadastro-engine/field/registerBuiltinFieldTypes.js"));
const builtinTypes = [...builtin.matchAll(/registerFieldType\("([^"]+)"/g)].map((m) => m[1]);
const catalogTypes = [...catalog.matchAll(/type:\s*"([^"]+)"/g)].map((m) => m[1]);
const missingInCatalog = builtinTypes.filter((t) => !catalogTypes.includes(t));
gate(
  "G172 — Catálogo certificação cobre tipos builtin",
  missingInCatalog.length === 0,
  missingInCatalog.length ? `faltam: ${missingInCatalog.join(", ")}` : ""
);

gate(
  "G173 — Módulo fictício fieldcert metadata-only",
  exists(path.join(ROOT, "src/modules/fieldcert/config/fieldCertModuleMetadata.js")) &&
    read(path.join(ROOT, "src/modules/fieldcert/config/fieldCertModuleMetadata.js")).includes(
      "buildMakDynamicFieldsFromMetadata"
    )
);

gate(
  "G174 — Sem Field Engine paralela no ModeloBase1",
  !exists(path.join(MB1, "fieldConfig/FieldRenderer.jsx")) &&
    !exists(path.join(MB1, "fieldConfig/DefaultControl.jsx"))
);

gate(
  "G175 — Build produção",
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
console.log(`\n${results.length - failed.length}/${results.length} gates passed`);
if (failed.length) {
  process.exit(1);
}
