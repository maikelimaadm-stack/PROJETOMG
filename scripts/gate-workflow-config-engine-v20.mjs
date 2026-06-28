#!/usr/bin/env node
/**
 * Gates G251–G261 — Workflow Configuration Engine V20.
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
  "G251 — Workflow Config Engine foundation",
  exists(path.join(MAK, "workflow/createMakWorkflowConfigEngine.js"))
);

gate(
  "G252 — ModeloBase1/workflowConfig re-exporta foundation",
  read(path.join(MB1, "workflowConfig/index.js")).includes("createMakWorkflowConfigEngine")
);

gate(
  "G253 — useMakFormWorkflowHandlers integrado MakCadastroForm",
  read(path.join(ROOT, "src/framework/mak/form/MakCadastroForm.jsx")).includes("useMakFormWorkflowHandlers")
);

gate(
  "G254 — Actions Engine runWorkflow integrado",
  read(path.join(MAK, "actions/makActionBuiltinTypes.js")).includes("runWorkflow")
);

gate(
  "G255 — Workflow steps delegam Validation/Formula/Actions",
  read(path.join(MAK, "workflow/makWorkflowBuiltinSteps.js")).includes("runMakFormValidation") &&
    read(path.join(MAK, "workflow/makWorkflowBuiltinSteps.js")).includes("runMakFormulaEvaluation") &&
    read(path.join(MAK, "workflow/makWorkflowBuiltinSteps.js")).includes("runMakActionExecution")
);

gate(
  "G256 — Metadata workflow declarativa",
  read(path.join(MAK, "workflow/buildMakWorkflowConfigMetadata.js")).includes("MAK_WORKFLOW_METADATA_KEYS")
);

gate(
  "G257 — Bootstrap registra workflow engine",
  read(path.join(ROOT, "src/modules/makBootstrap/registerMakPreferencesBootstrapModules.js")).includes(
    "registerMakWorkflowConfigEngine"
  )
);

const bootstrap = read(path.join(ROOT, "src/modules/makBootstrap/registerMakWorkflowConfigEngine.js"));
gate(
  "G258 — Módulos certificados + workflowcert registrados",
  bootstrap.includes("workflowcert") && bootstrap.includes("registerMakWorkflowConfigEngine")
);

const catalog = read(path.join(MAK, "workflow/workflowCertificationCatalog.js"));
const required = ["wf-create", "wf-approval", "approve", "cancel", "parallel", "rollback"];
gate(
  "G259 — Catálogo certificação cobre workflows oficiais",
  required.every((item) => catalog.includes(item))
);

gate(
  "G260 — Módulo fictício workflowcert metadata-only",
  exists(path.join(ROOT, "src/modules/workflowcert/config/workflowCertModuleMetadata.js")) &&
    read(path.join(ROOT, "src/modules/workflowcert/config/workflowCertModuleMetadata.js")).includes(
      "MAK_WORKFLOW_CERTIFICATION_DEFINITIONS"
    )
);

gate(
  "G261 — Factory ModeloBase1 embeds workflowEngine + sem engine paralela + build",
  read(path.join(MB1, "config/buildModeloBase1ConfigFromMakModule.js")).includes("workflowEngineMetadata") &&
    !exists(path.join(MB1, "workflowConfig/WorkflowRenderer.jsx")) &&
    !exists(path.join(MB1, "workflowConfig/MakWorkflowForm.jsx")) &&
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
console.log(`\nG251-G261: ${results.length - failed.length}/${results.length} gates passed`);
if (failed.length) {
  process.exit(1);
}
