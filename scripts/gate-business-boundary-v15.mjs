#!/usr/bin/env node
/**
 * Gates G176–G185 — Business Boundary Certification V15.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const EMP = path.join(ROOT, "src/modules/empresas");
const MAK = path.join(ROOT, "src/framework/mak");

const results = [];
const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const read = (filePath) => fs.readFileSync(filePath, "utf8");
const exists = (filePath) => fs.existsSync(filePath);

const formRuntime = read(path.join(EMP, "runtime/empresasFormRuntime.jsx"));
const formConstants = read(path.join(EMP, "components/formEmp.constants.js"));
const moduleMetadata = read(path.join(EMP, "config/empresasModuleMetadata.js"));

gate(
  "G176 — EMP_FORM_FIELD_DEFS declarativos no domínio",
  formConstants.includes("export const EMP_FORM_FIELD_DEFS") &&
    formConstants.includes("OPCOES_TIPO_PESSOA")
);

gate(
  "G177 — buildMakDynamicFieldsWithCustomFields na Foundation",
  exists(path.join(MAK, "fieldConfig/buildMakDynamicFieldsWithCustomFields.js")) &&
    exists(path.join(MAK, "fieldConfig/appendMakCustomDynamicFields.js"))
);

gate(
  "G178 — Empresas metadata usa Foundation builder (não runtime imperativo)",
  moduleMetadata.includes("buildMakDynamicFieldsWithCustomFields(EMP_FORM_FIELD_DEFS)") &&
    !moduleMetadata.includes("buildEmpresasDynamicFields")
);

gate(
  "G179 — empresasFormRuntime é wrapper fino (<20 linhas de lógica)",
  formRuntime.split("\n").length <= 15 && formRuntime.includes("buildMakDynamicFieldsWithCustomFields")
);

gate(
  "G180 — Máscaras SSOT em maskUtils (não duplicadas em Empresas)",
  exists(path.join(ROOT, "src/framework/cadastro-engine/field/maskUtils.js")) &&
    !formConstants.includes("const applyNumberMask") &&
    formConstants.includes("maskUtils")
);

gate(
  "G181 — Filtros range promovidos para shared/filters",
  exists(path.join(ROOT, "src/shared/filters/columnRangeFilters.js")) &&
    read(path.join(EMP, "components/tblEmp.filters.js")).includes("columnRangeFilters")
);

gate(
  "G182 — Filter fields layout factory na Foundation",
  exists(path.join(MAK, "filters/createMakFilterFieldsLayoutStorage.js"))
);

gate(
  "G183 — Field engine bootstrap registra EMP_FORM_FIELD_DEFS",
  read(path.join(ROOT, "src/modules/makBootstrap/registerMakFieldConfigEngine.js")).includes(
    "empresas: EMP_FORM_FIELD_DEFS"
  )
);

const standardFields = read(path.join(MAK, "metadata/buildMakStandardDynamicFields.jsx"));
gate(
  "G184 — Standard builder suporta resolveLabel e aliases de upload",
  standardFields.includes("resolveLabel") &&
    standardFields.includes("handleLogoUpload") &&
    standardFields.includes("codempresa")
);

gate(
  "G185 — Build produção",
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
